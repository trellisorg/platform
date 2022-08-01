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

function _initialManifestMap(
    manifests: DynamicComponentManifest[]
): ManifestMap {
    return new Map<string, DynamicComponentManifest>(
        manifests.map((manifest) => [manifest.componentId, manifest])
    );
}

function initializeEnvironmentManifests<T extends string = string>(
    manifests: DynamicComponentManifest<T>[]
) {
    return () => {
        const manifestMap: ManifestMap = inject(DYNAMIC_MANIFEST_MAP);

        const rxDynamicComponentPreloaderService = inject(
            RxDynamicComponentService
        );

        manifests.forEach((manifest) => {
            manifestMap.set(manifest.componentId, manifest);
        });

        // Send the manifests off to preload if they are configured to do so.
        rxDynamicComponentPreloaderService.processManifestPreloads(manifests);
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
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: initializeEnvironmentManifests(manifests),
            multi: true,
        },
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
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: initializeEnvironmentManifests(manifests),
            multi: true,
        },
    ];
}
