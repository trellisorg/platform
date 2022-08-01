import { InjectionToken, NgModuleFactory, Type } from '@angular/core';
import type { Observable } from 'rxjs';

export type ManifestMap = Map<string, DynamicComponentManifest>;

export const DEFAULT_TIMEOUT = 1_000;

/**
 * preload: Whether this manifest should be preloaded.
 * priority: Either IDLE or IMMEDIATE, First checked at global config, then manifest, then defaults to IDLE
 * timeout: The amount of time in milliseconds to wait for an idle callback before triggering a load
 */
export interface SharedManifestConfig {
    preload?: boolean;
    priority?: 'idle' | 'immediate';
    timeout?: number;
}

/**
 * devMode: Will enable logging to debug how things are loaded
 * manifests
 * cacheFactories: Whether or not to cache the factories that are piped through RxDynamicService (Can be buggy in places)
 *
 * TODO: allow for caching at the manifest level
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
export type LoadComponent =
    | Type<any>
    | Observable<Type<any>>
    | Promise<Type<any>>;

export type LoadComponentCallback = () => LoadComponent;

export type LoadModule =
    | Type<any>
    | NgModuleFactory<any>
    | Observable<Type<any>>
    | Promise<NgModuleFactory<any> | Type<any>>;

export type LoadModuleCallback = () => LoadModule;

export type DynamicComponentManifest<T = string> = SharedManifestConfig & {
    componentId: T;
} & (
        | { loadChildren: LoadModuleCallback }
        | { loadComponent: LoadComponentCallback }
    );

/**
 * The root configuration injection token
 */
export const DYNAMIC_COMPONENT_CONFIG =
    new InjectionToken<DynamicComponentRootConfig>('DYNAMIC_COMPONENT_CONFIG');

/**
 * A feature injection token to allow the RxDynamicComponentFeatureModule to register each of the feature
 * manifests in the manifest map.
 */
export const _FEATURE_DYNAMIC_COMPONENT_MANIFESTS = new InjectionToken<
    DynamicComponentManifest<unknown>[][]
>('FEATURE_DYNAMIC_COMPONENT_MANIFESTS');

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
export const DYNAMIC_COMPONENT = new InjectionToken<Type<unknown>>(
    'DYNAMIC_COMPONENT'
);
