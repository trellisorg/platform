import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    DynamicOutletComponent,
    provideRxDynamicComponent,
} from '@trellisorg/rx-dynamic-component';
import { LazyDynamicOutletComponent } from '@trellisorg/rx-dynamic-component/lazy';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        DynamicOutletComponent,
        LazyDynamicOutletComponent,
    ],
    providers: [
        provideRxDynamicComponent({
            devMode: true,
            manifests: [
                // {
                //     componentId: 'dynamic-remote',
                //     loadChildren: () =>
                //         import('dynamic-remote/Module').then(
                //             (m) => m.RemoteEntryModule
                //         ),
                // },
                {
                    componentId: 'dynamic-standalone',
                    loadComponent: () =>
                        import('./standalone/standalone.component').then(
                            (m) => m.StandaloneComponent
                        ),
                },
                {
                    componentId: 'dynamic-module',
                    loadChildren: () =>
                        import('./dynamic-module/dynamic-module.module').then(
                            (m) => m.DynamicModuleModule
                        ),
                },
            ],
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
