import { isPlatformBrowser } from '@angular/common';
import {
    Compiler,
    inject,
    Injectable,
    Injector,
    NgModuleFactory,
    NgZone,
    Optional,
    PLATFORM_ID,
    Type,
} from '@angular/core';
import {
    firstValueFrom,
    from,
    isObservable,
    Observable,
    of,
    tap,
    throwError,
} from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Logger } from './logger';
import {
    DEFAULT_TIMEOUT,
    DynamicComponentManifest,
    DynamicManifestPreloadPriority,
    DYNAMIC_COMPONENT,
    DYNAMIC_COMPONENT_CONFIG,
    DYNAMIC_MANIFEST_MAP,
    LoadComponentCallback,
    LoadModuleCallback,
    SharedManifestConfig,
} from './manifest';

function isPromiseOrObservable<T>(
    promiseOrObservable: Promise<T> | Observable<T> | any
): boolean {
    return (
        !!(promiseOrObservable as Promise<T>)?.then ||
        isObservable(promiseOrObservable)
    );
}

@Injectable({
    providedIn: 'root',
})
export class RxDynamicComponentService {
    private readonly manifests = inject(DYNAMIC_MANIFEST_MAP);

    private readonly loaded = new Map<string, Type<unknown>>();

    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private readonly config = inject(DYNAMIC_COMPONENT_CONFIG);

    constructor(
        @Optional() private _compiler: Compiler,
        private readonly _ngZone: NgZone,
        private readonly logger: Logger,
        private readonly _injector: Injector
    ) {}

    private cannotFindManifest(componentId: string): void {
        this.logger.error(
            `The componentId, ${componentId}, you supplied is not registered to a manifest. Did you mean one of ${Array.from(
                this.manifests.keys()
            ).join(',')}`
        );
    }

    /**
     * Loads the component manifest when configured as standalone components.
     * @param loadComponentCallback
     * @private
     */
    private loadComponent<TComponent>(
        loadComponentCallback: LoadComponentCallback
    ): Observable<Type<TComponent>> {
        const loadComponent = loadComponentCallback();

        return isObservable(loadComponent)
            ? loadComponent
            : from(Promise.resolve(loadComponent));
    }

    /**
     * Loads the component manifest when configured using an NgModule with a
     * DYNAMIC_COMPONENT provider
     * @param manifest
     * @param loadModuleCallback
     * @private
     */
    private loadModule<TComponent>(
        manifest: DynamicComponentManifest,
        loadModuleCallback: LoadModuleCallback
    ): Observable<Type<TComponent>> {
        const loadChildren = loadModuleCallback();

        /**
         * Use Promise.resolve() as we are unsure if loadChildren is a function that returns a promise, observable or a value
         */
        return (
            isObservable(loadChildren)
                ? loadChildren
                : from(Promise.resolve(loadChildren))
        ).pipe(
            switchMap((moduleOrFactory) => {
                /**
                 * If the app is not being run with AOT enabled then we may need to compile the module into a module factory
                 * before passing it onto the component factory resolver
                 */
                if (moduleOrFactory instanceof NgModuleFactory) {
                    return of(moduleOrFactory);
                } else if (this._compiler) {
                    return from(
                        this._compiler.compileModuleAsync(moduleOrFactory)
                    );
                } else {
                    return throwError(
                        () =>
                            `Looks like you have AOT disabled but your NgModule is not compiled into an NgModuleFactory.`
                    );
                }
            }),
            switchMap((factory) => {
                const moduleRef = factory.create(this._injector);

                /**
                 * By providing a DYNAMIC_COMPONENT injection in the module we are loading we know what component it is
                 * that should be rendered from the declarations array in the module
                 */
                const dynamicComponentType =
                    moduleRef.injector.get<Type<TComponent>>(DYNAMIC_COMPONENT);

                if (!dynamicComponentType) {
                    return throwError(
                        () =>
                            `No dynamic component found with id: ${manifest.componentId}`
                    );
                }

                return of(dynamicComponentType);
            })
        );
    }

    async processManifestPreloads(
        manifests: DynamicComponentManifest[]
    ): Promise<void> {
        for (const manifest of manifests) {
            /*
             * Should preload the manifest if explicitly set or inherited from the global config.
             *
             * Will only preload manifests that are promises or observables, ie. are dynamically imported, for
             * the cases where `loadChildren: () => Module` there is not need to preload since that Module is
             * included in the bundle already
             *
             * In the case where RxDynamicComponentModule.forFeature() is used in multiple places with the same componentId
             * or the module importing it is used multiple times this service will mark the componentId as preloaded already
             * so it will not try and load it again.
             */
            if (
                (manifest.preload ||
                    (manifest.preload !== false && this.config.preload)) &&
                isPromiseOrObservable(
                    'loadChildren' in manifest
                        ? manifest.loadChildren()
                        : manifest.loadComponent()
                ) &&
                !this.loaded.has(manifest.componentId)
            ) {
                // Will default to a timeout of 1 second
                const timeout =
                    manifest.timeout ?? this.config.timeout ?? DEFAULT_TIMEOUT;

                // If not specified the priority will always be IDLE
                const priority: DynamicManifestPreloadPriority =
                    manifest.priority ??
                    this.config.priority ??
                    DynamicManifestPreloadPriority.IDLE;

                if (NgZone.isInAngularZone()) {
                    this.logger.log(
                        `Is in NgZone, loading ${manifest.componentId} outside of zone.`
                    );
                    await this._ngZone.runOutsideAngular(
                        async () =>
                            await firstValueFrom(
                                this.loadWithOverrides(manifest, {
                                    timeout,
                                    priority,
                                })
                            )
                    );
                } else {
                    await firstValueFrom(
                        this.loadWithOverrides(manifest, { timeout, priority })
                    );
                }
            }
        }
    }

    /**
     * Will load the manifest with the specified priority by leveraging window.requestIdleCallback
     *
     * If that is unable (SSR or no browser support) priority will default to IMMEDIATE and the manifest will be
     * loaded right away
     * @param manifest
     * @param overrides
     */
    loadWithOverrides<TComponent = unknown>(
        manifest: DynamicComponentManifest,
        overrides?: Partial<SharedManifestConfig>
    ): Observable<Type<TComponent>> {
        /*
        If the cache of the loaded components has already loaded this one then
        reuse it.
         */
        if (this.loaded.has(manifest.componentId)) {
            return of(
                this.loaded.get(manifest.componentId) as Type<TComponent>
            );
        }

        const priority = overrides?.priority ?? manifest.priority;
        const timeout = overrides?.timeout ?? manifest.timeout;

        if (
            this.isBrowser &&
            'requestIdleCallback' in window &&
            priority === DynamicManifestPreloadPriority.IDLE
        ) {
            this.logger.log(
                `requestIdleCallback is available, scheduling load for "${manifest.componentId}" with a timeout of ${timeout}ms`
            );

            return new Observable<Type<TComponent>>((subscriber) => {
                window.requestIdleCallback(
                    async (idleDeadline) => {
                        const timeRemaining = idleDeadline.timeRemaining();
                        if (idleDeadline.didTimeout || timeRemaining > 0) {
                            this.logger.log(
                                `IdleDeadline for ${manifest.componentId} emitted. didTimeout: ${idleDeadline.didTimeout}, timeRemaining: ${timeRemaining}`
                            );
                            const component: Type<TComponent> =
                                await firstValueFrom(
                                    this.loadManifest(manifest)
                                );

                            subscriber.next(component);
                            subscriber.complete();
                        }
                    },
                    {
                        timeout,
                    }
                );
            });
        }

        if (priority === DynamicManifestPreloadPriority.IDLE) {
            this.logger.log(
                `requestIdleCallback is not available, loading ${manifest.componentId} immediately`
            );
        }

        return this.loadManifest<TComponent>(manifest);
    }

    /**
     * Loads the manifest conditionally on if it is loading standalone components or NgModules
     * @param manifest
     */
    loadManifest<TComponent>(
        manifest: DynamicComponentManifest
    ): Observable<Type<TComponent>> {
        this.logger.log(`Loading ${manifest.componentId}`);

        return (
            'loadChildren' in manifest
                ? this.loadModule<TComponent>(manifest, manifest.loadChildren)
                : this.loadComponent<TComponent>(manifest.loadComponent)
        ).pipe(
            tap((component) => this.loaded.set(manifest.componentId, component))
        );
    }

    /**
     * References:
     * https://github.com/angular/angular/issues/31886#issuecomment-517704935
     * https://indepth.dev/posts/1290/dynamically-loading-components-with-angular-cli
     *
     * This function with use throwError to throw an error in the observable stream, if you are handling
     * errors in your HTML templates from unwrapping observables like with the use of *ngrxLet or *ngrxPush
     * then this will allow you to display an error message in your template based on if this Observable
     * (or the underlying Promise when calling loadChildren()) fails.
     * @param manifestId
     * @param overrides
     */
    getComponent<TComponent = unknown>(
        manifestId: string,
        overrides?: Partial<SharedManifestConfig>
    ): Observable<Type<TComponent>> {
        const manifest = this.manifests.get(
            manifestId
        ) as DynamicComponentManifest;

        if (!manifest) {
            if (this.config.devMode) {
                this.cannotFindManifest(manifestId);
            }
            return throwError(
                () => `No manifest found for componentId: ${manifestId}`
            );
        }

        return this.loadWithOverrides<TComponent>(manifest, overrides).pipe(
            catchError((error) => {
                if (this.config.devMode) {
                    this.logger.error(
                        `There was an error resolving the component factory with componentId: ${manifestId}`,
                        error
                    );
                }

                return throwError(error);
            })
        );
    }
}
