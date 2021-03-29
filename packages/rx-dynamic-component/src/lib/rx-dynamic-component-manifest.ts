import { InjectionToken } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

export interface DynamicComponentConfig {
    manifests?: DynamicComponentManifest[];
}

export interface DynamicComponentRootConfig extends DynamicComponentConfig {
    devMode?: boolean;
}

export const defaultRootConfig: DynamicComponentRootConfig = {
    manifests: [],
    devMode: false,
};

export interface DynamicComponentManifest<T = string> {
    componentId: T;
    path: string;
    loadChildren: LoadChildrenCallback;
}

export const DYNAMIC_COMPONENT_CONFIG = new InjectionToken<any>(
    'DYNAMIC_COMPONENT_CONFIG'
);

export const _FEATURE_DYNAMIC_COMPONENT_MANIFESTS = new InjectionToken<any>(
    'FEATURE_DYNAMIC_COMPONENT_MANIFESTS'
);

export const DYNAMIC_MANIFEST_MAP = new InjectionToken<
    Map<string, DynamicComponentManifest>
>('DYNAMIC_MANIFEST_MAP');

export const DYNAMIC_COMPONENT = new InjectionToken<any>('DYNAMIC_COMPONENT');
