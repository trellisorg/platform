import {
    Inject,
    ModuleWithProviders,
    NgModule,
    OnDestroy,
} from '@angular/core';
import {
    _FEATURE_DYNAMIC_COMPONENT_MANIFESTS,
    defaultRootConfig,
    DYNAMIC_COMPONENT_CONFIG,
    DYNAMIC_MANIFEST_MAP,
    DynamicComponentManifest,
    DynamicComponentRootConfig,
    ManifestMap,
} from './rx-dynamic-component.manifest';
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
        @Inject(DYNAMIC_MANIFEST_MAP) map: ManifestMap
    ) {}
}

@NgModule({})
export class RxDynamicComponentFeatureModule implements OnDestroy {
    constructor(
        @Inject(_FEATURE_DYNAMIC_COMPONENT_MANIFESTS)
        private manifests: DynamicComponentManifest[],
        @Inject(DYNAMIC_MANIFEST_MAP)
        private manifestMap: ManifestMap
    ) {
        /**
         * Register each of the feature manifests with the root map
         */
        manifests.forEach((manifest) =>
            manifestMap.set(manifest.componentId, manifest)
        );
    }

    ngOnDestroy(): void {
        /**
         * When the module is destroyed unregister each manifest from the root manifest map
         */
        this.manifests.forEach((manifest) =>
            this.manifestMap.delete(manifest.componentId)
        );
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
    static forRoot(
        config: DynamicComponentRootConfig
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
            ],
        };
    }

    /**
     * If manifests are added in feature module then forFeature can be used to add manifests to the store of manifests in memory
     */
    static forFeature(
        manifests: DynamicComponentManifest[]
    ): ModuleWithProviders<RxDynamicComponentModule> {
        return {
            ngModule: RxDynamicComponentFeatureModule,
            providers: [
                {
                    provide: _FEATURE_DYNAMIC_COMPONENT_MANIFESTS,
                    useValue: manifests,
                },
            ],
        };
    }
}
