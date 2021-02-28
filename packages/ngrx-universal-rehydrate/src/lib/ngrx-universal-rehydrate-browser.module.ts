import { ModuleWithProviders, NgModule, PLATFORM_ID } from '@angular/core';
import { INIT, META_REDUCERS, MetaReducer } from '@ngrx/store';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    defaultNgrxUniversalHydrateConfig,
    NGRX_TRANSFER_HYDRATE_CONFIG,
    NgrxUniversalHydrateConfig,
} from './shared';
import { NgrxUniversalHydrationService } from './ngrx-universal-hydration.service';

export function rehydrateMetaReducer(
    platformId: Object,
    doc: Document,
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
                {
                    ...state,
                    ...ngrxUniversalHydrationService.readState(),
                },
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
export class NgrxUniversalRehydrateBrowserModule {
    static forRoot(
        config: Partial<NgrxUniversalHydrateConfig>
    ): ModuleWithProviders<NgrxUniversalRehydrateBrowserModule> {
        return {
            ngModule: NgrxUniversalRehydrateBrowserModule,
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
                        DOCUMENT,
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
