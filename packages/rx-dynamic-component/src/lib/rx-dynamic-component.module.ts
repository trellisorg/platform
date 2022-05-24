import { Inject, ModuleWithProviders, NgModule } from '@angular/core';
import { Logger } from './logger';
import {
    defaultRootConfig,
    DynamicComponentManifest,
    DynamicComponentRootConfig,
    DYNAMIC_COMPONENT_CONFIG,
    DYNAMIC_MANIFEST_MAP,
    ManifestMap,
    _FEATURE_DYNAMIC_COMPONENT_MANIFESTS,
} from './manifest';
import { RxDynamicComponentPreloaderService } from './rx-dynamic-component-preloader.service';
import { RxDynamicComponentService } from './rx-dynamic-component.service';

function _initialManifestMap(
    manifests: DynamicComponentManifest[]
): ManifestMap {
    return new Map<string, DynamicComponentManifest>(
        manifests.map((manifest) => [manifest.componentId, manifest])
    );
}

@NgModule({})
export class RxDynamicComponentRootModule {
    constructor(
        rxDynamicComponentService: RxDynamicComponentService,
        @Inject(DYNAMIC_COMPONENT_CONFIG) config: DynamicComponentRootConfig,
        @Inject(DYNAMIC_MANIFEST_MAP) map: ManifestMap,
        rxDynamicComponentPreloaderService: RxDynamicComponentPreloaderService
    ) {
        rxDynamicComponentPreloaderService.processManifestPreloads(
            config.manifests ?? []
        );
    }
}

@NgModule({})
export class RxDynamicComponentFeatureModule {
    constructor(
        @Inject(_FEATURE_DYNAMIC_COMPONENT_MANIFESTS)
        private manifests: DynamicComponentManifest[][],
        @Inject(DYNAMIC_MANIFEST_MAP)
        private manifestMap: ManifestMap,
        rxDynamicComponentPreloaderService: RxDynamicComponentPreloaderService
    ) {
        const flattened = manifests.flat();
        /**
         * Register each of the feature manifests with the root map
         */

        flattened.forEach((manifest) =>
            manifestMap.set(manifest.componentId, manifest)
        );

        rxDynamicComponentPreloaderService.processManifestPreloads(flattened);
    }
}

@NgModule({})
export class RxDynamicComponentModule {
    /**
     * Must be imported into the root AppModule so that the service is provided.
     *
     * Providing manifests at the root level is optional as they can be added later with forFeature
     * @param config
     */
    static forRoot<T extends string = string>(
        config: DynamicComponentRootConfig<T>
    ): ModuleWithProviders<RxDynamicComponentRootModule> {
        const mergedConfig: DynamicComponentRootConfig = {
            ...defaultRootConfig,
            ...config,
        };

        return {
            ngModule: RxDynamicComponentRootModule,
            providers: [
                RxDynamicComponentService,
                {
                    provide: DYNAMIC_COMPONENT_CONFIG,
                    useValue: mergedConfig,
                },
                {
                    provide: DYNAMIC_MANIFEST_MAP,
                    useValue: _initialManifestMap(mergedConfig.manifests || []),
                },
                RxDynamicComponentPreloaderService,
                Logger,
            ],
        };
    }

    /**
     * If manifests are added in feature module then forFeature can be used to add manifests to the store of manifests in memory
     */
    static forFeature<T extends string = string>(
        manifests: DynamicComponentManifest[]
    ): ModuleWithProviders<RxDynamicComponentFeatureModule> {
        return {
            ngModule: RxDynamicComponentFeatureModule,
            providers: [
                {
                    provide: _FEATURE_DYNAMIC_COMPONENT_MANIFESTS,
                    useValue: manifests,
                    multi: true,
                },
            ],
        };
    }
}
