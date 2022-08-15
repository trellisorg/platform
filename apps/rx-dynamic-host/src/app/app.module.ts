import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule } from '@angular/router';
import { provideRxDynamicComponent, RxDynamicDirective } from '@trellisorg/rx-dynamic-component';
import { AppComponent } from './app.component';
import { StandaloneAdapterDirective } from './standalone/standalone-adapter.directive';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
        RxDynamicDirective,
        StandaloneAdapterDirective,
    ],
    providers: [
        provideRxDynamicComponent({
            devMode: false,
            manifests: [
                {
                    componentId: 'dynamic-standalone',
                    loadComponent: () =>
                        import('./standalone/standalone.component').then((m) => m.StandaloneComponent),
                },
                {
                    componentId: 'dynamic-standalone2',
                    loadComponent: () =>
                        import('./standalone/standalone2.component').then((m) => m.Standalone2Component),
                },
                {
                    componentId: 'dynamic-idle-standalone',
                    loadComponent: () =>
                        import('./idle-load-standalone/idle-load-standalone.component').then(
                            (m) => m.IdleLoadStandaloneComponent
                        ),
                },
                {
                    componentId: 'dynamic-module',
                    loadChildren: () =>
                        import('./dynamic-module/dynamic-module.module').then((m) => m.DynamicModuleModule),
                },
            ],
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
