import type { Type } from '@angular/core';
import {
    Compiler,
    Inject,
    Injectable,
    Injector,
    NgModuleFactory,
    Optional,
} from '@angular/core';
import type { Observable } from 'rxjs';
import { from, isObservable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Logger } from './logger';
import {
    DEFAULT_TIMEOUT,
    DynamicComponentManifest,
    DynamicComponentRootConfig,
    DynamicManifestPreloadPriority,
    DYNAMIC_COMPONENT,
    DYNAMIC_COMPONENT_CONFIG,
    DYNAMIC_MANIFEST_MAP,
    LoadComponentCallback,
    LoadModuleCallback,
    ManifestMap,
} from './manifest';
import { RxDynamicComponentPreloaderService } from './rx-dynamic-component-preloader.service';

@Injectable({
    providedIn: 'root',
})
export class RxDynamicComponentService {
    private readonly componentCache: Map<string, Type<any>> = new Map<
        string,
        Type<any>
    >();

    constructor(
        @Inject(DYNAMIC_MANIFEST_MAP)
        private manifests: ManifestMap,
        @Optional() private _compiler: Compiler,
        private _injector: Injector,
        @Inject(DYNAMIC_COMPONENT_CONFIG)
        private config: DynamicComponentRootConfig,
        private logger: Logger,
        private rxDynamicComponentPreloaderService: RxDynamicComponentPreloaderService
    ) {}

    private cannotFindManifest(componentId: string): void {
        this.logger.error(
            `The componentId, ${componentId}, you supplied is not registered to a manifest. Did you mean one of ${Array.from(
                this.manifests.keys()
            ).join(',')}`
        );
    }

    /**
     * Manually trigger a load for a manifest to preload it
     * @param componentId
     * @param priority
     */
    loadManifest(
        componentId: string,
        priority: DynamicManifestPreloadPriority = DynamicManifestPreloadPriority.IDLE
    ): Promise<void> {
        const manifest = this.manifests.get(componentId);

        if (!manifest) {
            this.cannotFindManifest(componentId);
            throw new Error(
                `${componentId} does not exist in the ManifestMap.`
            );
        }

        return this.rxDynamicComponentPreloaderService.loadWithPriority(
            manifest,
            DEFAULT_TIMEOUT,
            priority
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
     * @param componentId
     */
    getComponent(componentId: string): Observable<Type<any>> {
        const manifest = this.manifests.get(componentId);

        if (!manifest) {
            if (this.config.devMode) {
                this.cannotFindManifest(componentId);
            }
            return throwError(
                () => `No manifest found for componentId: ${componentId}`
            );
        }

        /*
         * Factories can be cached at either the global level or at the manifest level
         */
        const component = this.componentCache.get(componentId);
        if (
            (manifest.cacheComponents ||
                (this.config.cacheComponents &&
                    manifest.cacheComponents === undefined)) &&
            component
        ) {
            return of(component);
        }

        return (
            'loadChildren' in manifest
                ? this.loadModule(manifest, manifest.loadChildren)
                : this.loadComponent(manifest.loadComponent)
        ).pipe(
            tap((componentFactory) => {
                if (
                    this.config.cacheComponents &&
                    !this.componentCache.has(componentId)
                )
                    this.componentCache.set(componentId, componentFactory);
            }),
            catchError((error) => {
                if (this.config.devMode) {
                    this.logger.error(
                        `There was an error resolving the component factory with componentId: ${componentId}`,
                        error
                    );
                }

                return throwError(error);
            })
        );
    }

    private loadComponent(
        loadComponentCallback: LoadComponentCallback
    ): Observable<Type<any>> {
        const loadComponent = loadComponentCallback();

        return isObservable(loadComponent)
            ? loadComponent
            : from(Promise.resolve(loadComponent));
    }

    private loadModule(
        manifest: DynamicComponentManifest,
        loadModuleCallback: LoadModuleCallback
    ): Observable<Type<any>> {
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
                    moduleRef.injector.get<Type<any>>(DYNAMIC_COMPONENT);

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
}
