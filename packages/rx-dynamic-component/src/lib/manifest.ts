import { InjectionToken } from '@angular/core';
import type { LoadChildrenCallback } from '@angular/router';

export type ManifestMap = Map<string, DynamicComponentManifest>;

export const DEFAULT_TIMEOUT = 1_000;

/**
 * Root configuration for RxDynamicComponent
 * devMode: disabling devMode will prevent console.warn's when an issue arises.
 * manifests: The manifests to store in a map which can be lazy loaded and inserted into the dom. This can be empty for the root
 * since manifests can be added with forFeature as well.
 */
export const enum DynamicManifestPreloadPriority {
    IMMEDIATE = 'immediate',
    IDLE = 'idle',
}

/**
 * preload: Whether or not this manifest should be preloaded.
 * priority: Either IDLE or IMMEDIATE, First checked at global config, then manifest, then defaults to IDLE
 * timeout: The amount of time in milliseconds to wait for an idle callback before triggering a load
 * cacheFactories: Whether this factory should be cached or if all factories can be cached
 */
export interface SharedManifestConfig {
    preload?: boolean;
    priority?: DynamicManifestPreloadPriority;
    timeout?: number;
    cacheFactories?: boolean;
}

/**
 * devMode: Will enable logging to debug how things are loaded
 * manifests
 */
export interface DynamicComponentRootConfig<T extends string = string>
    extends SharedManifestConfig {
    devMode?: boolean;
    manifests?: DynamicComponentManifest<T>[];
}

export const defaultRootConfig: DynamicComponentRootConfig = {
    manifests: [],
    devMode: false,
    preload: false,
};

/**
 * DynamicComponentManifest is similar to how lazy loaded routes are configured with @angular/router
 * componentId is used to find the correct module to load in the manifest map
 */

export interface DynamicComponentManifest<T = string>
    extends SharedManifestConfig {
    componentId: T;
    loadChildren: LoadChildrenCallback;
}

/**
 * The root configuration injection token
 */
export const DYNAMIC_COMPONENT_CONFIG = new InjectionToken<any>(
    'DYNAMIC_COMPONENT_CONFIG'
);

/**
 * A feature injection token to allow the RxDynamicComponentFeatureModule to register each of the feature
 * manifests in the manifest map.
 */
export const _FEATURE_DYNAMIC_COMPONENT_MANIFESTS = new InjectionToken<any>(
    'FEATURE_DYNAMIC_COMPONENT_MANIFESTS'
);

/**
 * The libraries manifest, this is global across the application which feature manifests being added and removed during
 * import and ngOnDestroy respectively.
 */
export const DYNAMIC_MANIFEST_MAP = new InjectionToken<ManifestMap>(
    'DYNAMIC_MANIFEST_MAP'
);

/**
 * Injection token used for telling the library what component in a lazy loaded module to use for rendering
 */
export const DYNAMIC_COMPONENT = new InjectionToken<any>('DYNAMIC_COMPONENT');
