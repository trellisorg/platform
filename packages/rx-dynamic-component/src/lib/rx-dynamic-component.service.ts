import {
    Compiler,
    ComponentFactory,
    Inject,
    Injectable,
    Injector,
    NgModuleFactory,
} from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
    DynamicComponentManifest,
    DynamicComponentRootConfig,
    DYNAMIC_COMPONENT,
    DYNAMIC_COMPONENT_CONFIG,
    DYNAMIC_MANIFEST_MAP,
} from './rx-dynamic-component-manifest';

@Injectable()
export class RxDynamicComponentService {
    constructor(
        @Inject(DYNAMIC_MANIFEST_MAP)
        private manifests: Map<string, DynamicComponentManifest>,
        private _compiler: Compiler,
        private _injector: Injector,
        @Inject(DYNAMIC_COMPONENT_CONFIG)
        private config: DynamicComponentRootConfig
    ) {}

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
     * @param injector
     */
    getComponentFactory<T>(
        componentId: string,
        injector?: Injector
    ): Observable<ComponentFactory<T>> {
        const manifest = this.manifests.get(componentId);

        if (!manifest) {
            if (this.config.devMode) {
                console.warn(
                    `Could not find a manifest with componentId: ${componentId}. Did you mean one of: ${Array.from(
                        this.manifests.keys()
                    ).join(',')}?`
                );
            }
            return throwError(
                `No manifest found for componentId: ${componentId}`
            );
        }

        const loadChildren = manifest.loadChildren();

        /**
         * Use Promise.resolve as we are unsure if loadChildren is a function that returns a promise or a value
         */
        return from(Promise.resolve(loadChildren)).pipe(
            switchMap((moduleOrFactory) => {
                /**
                 * If the app is not being run with AOT enabled then we may need to compile the module into a module factory
                 * before passing it onto the component factory resolver
                 */
                if (moduleOrFactory instanceof NgModuleFactory) {
                    return of(moduleOrFactory);
                } else {
                    return from(
                        this._compiler.compileModuleAsync(moduleOrFactory)
                    );
                }
            }),
            switchMap((factory) => {
                const moduleRef = factory.create(injector || this._injector);

                /**
                 * By providing a DYNAMIC_COMPONENT injection in the module we are loading we know what component it is
                 * that should be rendered from the declarations array in the module
                 */
                const dynamicComponentType = moduleRef.injector.get(
                    DYNAMIC_COMPONENT
                );

                return of(
                    moduleRef.componentFactoryResolver.resolveComponentFactory<T>(
                        dynamicComponentType
                    )
                );
            }),
            catchError((error) => {
                if (this.config.devMode) {
                    console.error(
                        `There was an error resolving the component factory with componentId: ${componentId}`,
                        error
                    );
                }

                return throwError(error);
            })
        );
    }
}
