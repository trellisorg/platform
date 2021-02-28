import { InjectionToken } from '@angular/core';
import { makeStateKey, StateKey } from '@angular/platform-browser';

export const enum MergeStrategy {
    OVERWRITE = 'overwrite',
    MERGE_OVER = 'mergeOver',
    MERGE_UNDER = 'mergeUnder',
}

export const defaultNgrxUniversalHydrateConfig: NgrxUniversalHydrateConfig = {
    stores: undefined,
    disableWarnings: false,
    mergeStrategy: MergeStrategy.MERGE_OVER,
};

export interface NgrxUniversalHydrateConfig {
    stores: string[] | undefined;
    disableWarnings: boolean;
    mergeStrategy: MergeStrategy;
}

export const NGRX_TRANSFER_HYDRATE_CONFIG = new InjectionToken<NgrxUniversalHydrateConfig>(
    'ngrxUniversalHydrateConfig'
);

export function createTransferStateKey<T>(
    config: NgrxUniversalHydrateConfig
): StateKey<T> {
    return makeStateKey<T>(
        `ngrx-${
            config.stores?.length > 0
                ? config.stores.sort().join('-')
                : 'full-store'
        }-rehydration`
    );
}

export function merge(over: any, under: any): any {
    return Object.entries(over).reduce(
        (prev, [key, value]) => ({
            ...prev,
            [key]: value,
        }),
        under
    );
}

export function mergeStates(
    initial: any,
    transfer: any,
    mergeStrategy: MergeStrategy
): any {
    switch (mergeStrategy) {
        case MergeStrategy.OVERWRITE:
            return transfer;
        case MergeStrategy.MERGE_OVER:
            return merge(transfer, initial);
        case MergeStrategy.MERGE_UNDER:
            return merge(initial, transfer);
        default:
            throw Error('Invalid merge strategy must be one of MergeStrategy');
    }
}
