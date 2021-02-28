import { ModuleWithProviders, NgModule, PLATFORM_ID } from '@angular/core';
import { INIT, META_REDUCERS, MetaReducer } from '@ngrx/store';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    defaultNgrxUniversalHydrateConfig,
    mergeStates,
    NGRX_TRANSFER_HYDRATE_CONFIG,
    NgrxUniversalHydrateConfig,
} from './shared';
import { NgrxUniversalHydrationService } from './ngrx-universal-hydration.service';

export function rehydrateMetaReducer(
    platformId: Object,
    config: NgrxUniversalHydrateConfig,
    ngrxUniversalHydrationService: NgrxUniversalHydrationService
): MetaReducer<unknown> {
    return (reducer) => (state: any, action) => {
        const isBrowser = isPlatformBrowser(platformId);

        if (isBrowser && action.type === INIT) {
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
        } else if (!isBrowser) {
            const newState = reducer(state, action);

            if (newState) {
                /**
                 * Only persist state for store slices that are configured
                 */
                ngrxUniversalHydrationService.state = config.stores.reduce(
                    (prev, cur) => ({
                        ...prev,
                        [cur]: newState[cur],
                    }),
                    {}
                );

                return newState;
            }
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
