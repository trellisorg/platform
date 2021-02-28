import { InjectionToken } from '@angular/core';
import { makeStateKey, StateKey } from '@angular/platform-browser';

export interface NgrxTransferHydrateConfig {
    stores: string[];
}

export const NGRX_TRANSFER_HYDRATE_CONFIG = new InjectionToken<NgrxTransferHydrateConfig>(
    'ngrxTransferHydrateConfig'
);

export function createTransferStateKey<T>(
    config: NgrxTransferHydrateConfig
): StateKey<T> {
    return makeStateKey<T>(
        `ngrx-${config.stores.sort().join('-') || 'full-store'}-rehydration`
    );
}
