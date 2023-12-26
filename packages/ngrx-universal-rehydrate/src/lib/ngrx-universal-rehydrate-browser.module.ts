import { isPlatformServer } from '@angular/common';
import { Inject, Injector, ModuleWithProviders, NgModule, PLATFORM_ID, TransferState } from '@angular/core';

import { META_REDUCERS, Store } from '@ngrx/store';
import { browserRehydrateReducer } from './reducers';
import { RehydrationLogger } from './rehydration-logger';
import { RehydrateStoreModule, addSlice } from './store';
import { FEATURE_STORES, REHYDRATE_ROOT_CONFIG } from './tokens';
import { RehydrationRootConfig, defaultRehydrationRootConfig } from './utils';

@NgModule({
    imports: [RehydrateStoreModule],
})
export class NgrxUniversalRehydrateBrowserRootModule {
    constructor(
        _injector: Injector,
        @Inject(REHYDRATE_ROOT_CONFIG) rootConfig: RehydrationRootConfig,
        // eslint-disable-next-line @typescript-eslint/ban-types
        @Inject(PLATFORM_ID) platformId: Object,
        _store: Store
    ) {
        /*
         * If we are on the server then we need to add the slices defined at root
         * to the store so they can be transferred
         */
        if (isPlatformServer(platformId)) {
            _store.dispatch(addSlice({ slices: rootConfig.stores ?? [] }));
        }
    }
}

@NgModule({})
export class NgrxUniversalRehydrateBrowserFeatureModule {
    constructor(
        @Inject(FEATURE_STORES) private stores: string[],
        // eslint-disable-next-line @typescript-eslint/ban-types
        @Inject(PLATFORM_ID) platformId: Object,
        private _store: Store
    ) {
        if (isPlatformServer(platformId)) this._store.dispatch(addSlice({ slices: stores }));
    }
}

@NgModule({})
export class NgrxUniversalRehydrateBrowserModule {
    static forRoot(
        config: Partial<RehydrationRootConfig>
    ): ModuleWithProviders<NgrxUniversalRehydrateBrowserRootModule> {
        return {
            ngModule: NgrxUniversalRehydrateBrowserRootModule,
            providers: [
                {
                    provide: REHYDRATE_ROOT_CONFIG,
                    useValue: {
                        ...defaultRehydrationRootConfig,
                        ...config,
                    },
                },
                {
                    provide: META_REDUCERS,
                    deps: [PLATFORM_ID, TransferState, REHYDRATE_ROOT_CONFIG],
                    useFactory: browserRehydrateReducer,
                    multi: true,
                },
                RehydrationLogger,
            ],
        };
    }

    static forFeature(
        stores: RehydrationRootConfig['stores']
    ): ModuleWithProviders<NgrxUniversalRehydrateBrowserFeatureModule> {
        return {
            ngModule: NgrxUniversalRehydrateBrowserFeatureModule,
            providers: [
                {
                    provide: FEATURE_STORES,
                    useValue: stores,
                    multi: true,
                },
            ],
        };
    }
}
