import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    provideRxDynamicComponent,
    RxDynamicDirective,
} from '@trellisorg/rx-dynamic-component';
import { LazyDynamicOutletComponent } from '@trellisorg/rx-dynamic-component/lazy';
import { AppComponent } from './app.component';
import { StandaloneAdapterDirective } from './standalone/standalone-adapter.directive';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RxDynamicDirective,
        LazyDynamicOutletComponent,
        StandaloneAdapterDirective,
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
                    componentId: 'dynamic-idle-standalone',
                    loadComponent: () =>
                        import(
                            './idle-load-standalone/idle-load-standalone.component'
                        ).then((m) => m.IdleLoadStandaloneComponent),
                },
                {
                    componentId: 'dynamic-rendered-at',
                    loadComponent: () =>
                        import('./rendered-at/rendered-at.component').then(
                            (m) => m.RenderedAtComponent
                        ),
                },
                {
                    componentId: 'dynamic-rendered-at2',
                    loadComponent: () =>
                        import('./rendered-at2/rendered-at2.component').then(
                            (m) => m.RenderedAt2Component
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
