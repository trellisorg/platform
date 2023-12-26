import { isPlatformBrowser } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgrxUniversalRehydrateBrowserModule } from '@trellisorg/ngrx-universal-rehydrate';
import { AppComponent } from './app.component';
import { Effects } from './effects';
import { loadData, titleReducer } from './store';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        StoreModule.forRoot(
            { root: titleReducer },
            {
                runtimeChecks: {
                    strictStateSerializability: false,
                },
            }
        ),
        EffectsModule.forRoot([Effects]),
        NgrxUniversalRehydrateBrowserModule.forRoot({
            stores: ['root'],
            disableWarnings: false,
        }),
        StoreDevtoolsModule.instrument({ connectInZone: true }),
        HttpClientModule,
        HttpClientJsonpModule,
        RouterModule.forRoot([
            {
                path: 'feature1',
                loadChildren: () => import('./feature1/feature1.module').then((m) => m.Feature1Module),
            },
            {
                path: 'feature2',
                loadChildren: () => import('./feature2/feature2.module').then((m) => m.Feature2Module),
            },
        ]),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(
        // eslint-disable-next-line @typescript-eslint/ban-types
        @Inject(PLATFORM_ID) private platformId: Object,
        private _store: Store
    ) {
        if (!isPlatformBrowser(platformId)) this._store.dispatch(loadData());
    }
}
