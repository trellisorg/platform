import { ModuleWithProviders, NgModule, PLATFORM_ID } from '@angular/core';
import { INIT, META_REDUCERS, MetaReducer } from '@ngrx/store';
import { isPlatformBrowser } from '@angular/common';
import {
    defaultNgrxUniversalHydrateConfig,
    mergeStates,
    NGRX_TRANSFER_HYDRATE_CONFIG,
    NgrxUniversalHydrateConfig,
} from './shared';
import { NgrxUniversalHydrationService } from './ngrx-universal-hydration.service';

export function rehydrateMetaReducer(
    platformId: Record<string, any>,
    config: NgrxUniversalHydrateConfig,
    ngrxUniversalHydrationService: NgrxUniversalHydrationService
): MetaReducer<unknown> {
    const isBrowser = isPlatformBrowser(platformId);

    /**
     * If we are in the browser return a meta reducer that will parse the initial state from
     * the transfer state on INIT
     */
    if (isBrowser) {
        return (reducer) => (state, action) => {
            if (action.type === INIT) {
                /**
                 * Rehydrate default state based on transferred data from the server
                 */
                return reducer(
                    mergeStates(
                        state,
                        ngrxUniversalHydrationService.readState(),
                        config.mergeStrategy
                    ),
                    action
                );
            }

            return reducer(state, action);
        };
    }

    /**
     * If we are in the server environment return the meta reducer that will save the updated states into the transfer
     * state based on the store slices configured.
     */
    return (reducer) => (state, action) => {
        const newState = reducer(state, action);

        if (newState) {
            /**
             * Only persist state for store slices that are configured
             * TODO: Optimize this
             */
            if (config.stores?.length > 0) {
                ngrxUniversalHydrationService.state = config.stores.reduce(
                    (prev, cur) => ({
                        ...prev,
                        [cur]: newState[cur],
                    }),
                    {}
                );
            } else {
                ngrxUniversalHydrationService.state = newState;
            }

            return newState;
        }

        return reducer(state, action);
    };
}

@NgModule({})
export class NgrxUniversalRehydrateModule {
    static forRoot(
        config: Partial<NgrxUniversalHydrateConfig>
    ): ModuleWithProviders<NgrxUniversalRehydrateModule> {
        return {
            ngModule: NgrxUniversalRehydrateModule,
            providers: [
                {
                    provide: NGRX_TRANSFER_HYDRATE_CONFIG,
                    useValue: {
                        ...defaultNgrxUniversalHydrateConfig,
                        ...config,
                    },
                },
                NgrxUniversalHydrationService,
                {
                    provide: META_REDUCERS,
                    deps: [
                        PLATFORM_ID,
                        NGRX_TRANSFER_HYDRATE_CONFIG,
                        NgrxUniversalHydrationService,
                    ],
                    useFactory: rehydrateMetaReducer,
                    multi: true,
                },
            ],
        };
    }
}
