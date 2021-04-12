import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import {
    BrowserModule,
    BrowserTransferStateModule,
} from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgrxUniversalRehydrateModule } from '@trellisorg/ngrx-universal-rehydrate';
import { loadData, titleReducer } from './store';
import { EffectsModule } from '@ngrx/effects';
import { Effects } from './effects';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        StoreModule.forRoot(
            { titleState: titleReducer },
            {
                runtimeChecks: {
                    strictStateSerializability: true,
                },
            }
        ),
        EffectsModule.forRoot([Effects]),
        NgrxUniversalRehydrateModule.forRoot({ stores: [] }),
        StoreDevtoolsModule.instrument({}),
        BrowserTransferStateModule,
        HttpClientModule,
        HttpClientJsonpModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(
        @Inject(PLATFORM_ID) private platformId: Record<string, any>,
        private _store: Store
    ) {
        if (!isPlatformBrowser(platformId)) this._store.dispatch(loadData());
    }
}
