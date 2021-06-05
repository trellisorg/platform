import { isPlatformBrowser } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import {
    BrowserModule,
    BrowserTransferStateModule,
} from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgrxUniversalRehydrateModule } from '@trellisorg/ngrx-universal-rehydrate';
import { AppComponent } from './app.component';
import { Effects } from './effects';
import { loadData, titleReducer } from './store';

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
        @Inject(PLATFORM_ID) private platformId: Object,
        private _store: Store
    ) {
        if (!isPlatformBrowser(platformId)) this._store.dispatch(loadData());
    }
}
