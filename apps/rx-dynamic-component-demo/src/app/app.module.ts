import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
    DynamicManifestPreloadPriority,
    DynamicOutletModule,
    provideRxDynamicComponent,
    provideRxDynamicComponentManifests,
} from '@trellisorg/rx-dynamic-component';
import { LazyDynamicOutletModule } from '@trellisorg/rx-dynamic-component/lazy';
import { AppComponent } from './app.component';
import { DialogModule } from './dialog/dialog.module';
import { QueryParam2Module } from './query-param2/query-param2.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        DynamicOutletModule,
        LazyDynamicOutletModule,
        RouterModule.forRoot([]),
        FormsModule,
        MatBottomSheetModule,
        DialogModule,
        BrowserAnimationsModule,
    ],
    providers: [
        provideRxDynamicComponent({
            devMode: true,
            manifests: [
                /**
                 * Can be used with dynamic import like lazy loaded routes
                 */
                {
                    componentId: 'query1',
                    loadChildren: () =>
                        import('./query-param1/query-param1.module').then(
                            (m) => m.QueryParam1Module
                        ),
                    // preload: false overrides the global preload: true flag for this manifest
                    preload: false,
                },
                /**
                 * Or can be used to reference the module directly
                 */
                {
                    componentId: 'query2',
                    loadChildren: () => QueryParam2Module,
                },
                /**
                 * Will preload using requestIdleTimeout which will load it when not blocking the main thread
                 */
                {
                    componentId: 'preload-idle',
                    loadChildren: () =>
                        import('./preload-idle/preload-idle.module').then(
                            (m) => m.PreloadIdleModule
                        ),
                    preload: true,
                    priority: DynamicManifestPreloadPriority.IDLE,
                },
            ],
            preload: true,
        }),
        provideRxDynamicComponentManifests([
            /**
             * Is loaded via the RxDynamicComponentService, does not need to have the preload flag as the service
             * will explicitly preload it when called.
             *
             * Remember, if preload is set to true globally then this needs to have preload set to false otherwise
             * it will be automatically preloaded rather than preloaded when the service calls load manifest
             */
            {
                componentId: 'service-preload',
                loadChildren: () =>
                    import('./service-preload/service-preload.module').then(
                        (m) => m.ServicePreloadModule
                    ),
                preload: false,
            },
        ]),
        /**
         * Providing these separately to test that multiple feature modules do not overwrite each other
         */
        provideRxDynamicComponentManifests([
            /**
             * Will preload immediately, may cause main thread blocking
             */
            {
                componentId: 'preload-immediate',
                loadChildren: () =>
                    import('./preload-immediate/preload-immediate.module').then(
                        (m) => m.PreloadImmediateModule
                    ),
                preload: true,
                priority: DynamicManifestPreloadPriority.IMMEDIATE,
            },
        ]),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
