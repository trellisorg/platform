import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import {
    BrowserModule,
    BrowserTransferStateModule,
} from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { isPlatformBrowser } from '@angular/common';
import { NgrxUniversalRehydrateBrowserModule } from '@trellisorg/ngrx-universal-rehydrate';
import { setServer, titleReducer } from './store';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        StoreModule.forRoot({ titleState: titleReducer }),
        NgrxUniversalRehydrateBrowserModule.forRoot({ stores: ['titleState'] }),
        StoreDevtoolsModule.instrument({}),
        BrowserTransferStateModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private _store: Store
    ) {
        if (!isPlatformBrowser(this.platformId))
            this._store.dispatch(
                setServer({
                    data: {
                        title:
                            'this data was saved to the store in universal, no action is dispatched while in browser',
                    },
                })
            );
    }
}
