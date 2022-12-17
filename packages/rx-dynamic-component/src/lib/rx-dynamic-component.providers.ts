import type { Provider } from '@angular/core';
import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import {
    defaultRootConfig,
    DynamicComponentManifest,
    DynamicComponentRootConfig,
    DYNAMIC_COMPONENT_CONFIG,
    DYNAMIC_MANIFEST_MAP,
    ManifestMap,
    _FEATURE_DYNAMIC_COMPONENT_MANIFESTS,
} from './manifest';
import { RxDynamicComponentService } from './rx-dynamic-component.service';

function _initialManifestMap(manifests: DynamicComponentManifest[]): ManifestMap {
    return new Map<string, DynamicComponentManifest>(manifests.map((manifest) => [manifest.componentId, manifest]));
}

/**
 * Provides the RxDynamicComponentService wherever the manifests are registered. Manifests will be inherited down
 * the injection tree so feature modules will have the same manifests as the root injector or any features above them.
 * @param manifests
 */
function provideRxDynamicComponentService<T extends string = string>(
    manifests: DynamicComponentManifest<T>[]
): Provider[] {
    return [
        RxDynamicComponentService,
        {
            provide: ENVIRONMENT_INITIALIZER,
            multi: true,
            useValue() {
                const manifestMap = inject(DYNAMIC_MANIFEST_MAP);
                const featureManifestMaps = inject(_FEATURE_DYNAMIC_COMPONENT_MANIFESTS, { optional: true });

                const rxDynamicComponentPreloaderService = inject(RxDynamicComponentService);

                rxDynamicComponentPreloaderService.addManifests([
                    ...manifests,
                    ...manifestMap.values(),
                    ...(featureManifestMaps ? featureManifestMaps[featureManifestMaps.length - 1] : []),
                ]);
            },
        },
    ];
}

/**
 * Preload all the root manifests
 * @param manifests
 */
function preloadManifests(manifests: DynamicComponentManifest[]) {
    return {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useValue() {
            // Send the manifests off to preload if they are configured to do so.
            inject(RxDynamicComponentService).processManifestPreloads(manifests);
        },
    };
}

/**
 * Root providers that should be provided as high up in the dependency tree as you want to use this library.
 *
 * This provider function takes over for ModuleWithProviders and the `forRoot` method.
 * @param config
 */
export function provideRxDynamicComponent<T extends string = string>(
    config: DynamicComponentRootConfig<T>
): Provider[] {
    const mergedConfig: DynamicComponentRootConfig = {
        ...defaultRootConfig,
        ...config,
    };

    const manifests = mergedConfig.manifests || [];

    return [
        {
            provide: DYNAMIC_COMPONENT_CONFIG,
            useValue: mergedConfig,
        },
        {
            provide: DYNAMIC_MANIFEST_MAP,
            useValue: _initialManifestMap(manifests),
        },
        provideRxDynamicComponentService(manifests),
        preloadManifests(manifests),
    ];
}

/**
 * The `feature` provider function that can be used to load additional manifests
 * @param manifests
 */
export function provideRxDynamicComponentManifests<T extends string = string>(
    manifests: DynamicComponentManifest<T>[]
): Provider[] {
    return [
        {
            provide: _FEATURE_DYNAMIC_COMPONENT_MANIFESTS,
            useValue: manifests,
            multi: true,
        },
        provideRxDynamicComponentService(manifests),
        preloadManifests(manifests),
    ];
}
