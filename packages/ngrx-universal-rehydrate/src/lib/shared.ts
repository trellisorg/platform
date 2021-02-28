import { InjectionToken } from '@angular/core';
import { makeStateKey, StateKey } from '@angular/platform-browser';

export const defaultNgrxUniversalHydrateConfig: NgrxUniversalHydrateConfig = {
    stores: undefined,
    disableWarnings: false,
};

export interface NgrxUniversalHydrateConfig {
    stores: string[] | undefined;
    disableWarnings: boolean;
}

export const NGRX_TRANSFER_HYDRATE_CONFIG = new InjectionToken<NgrxUniversalHydrateConfig>(
    'ngrxUniversalHydrateConfig'
);

export function createTransferStateKey<T>(
    config: NgrxUniversalHydrateConfig
): StateKey<T> {
    return makeStateKey<T>(
        `ngrx-${config.stores.sort().join('-') || 'full-store'}-rehydration`
    );
}
