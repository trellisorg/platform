import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { provideRxDynamicComponent, provideRxDynamicComponentManifests } from '@trellisorg/rx-dynamic-component';
import { RxDynamicDirective, RxDynamicLoadDirective } from '@trellisorg/rx-dynamic-component/template';
import { AppComponent } from './app.component';
import { StandaloneAdapterDirective } from './standalone/standalone-adapter.directive';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
        RxDynamicDirective,
        StandaloneAdapterDirective,
        MatDialogModule,
        BrowserAnimationsModule,
        RxDynamicLoadDirective,
    ],
    providers: [
        provideRxDynamicComponent({
            devMode: false,
            manifests: [
                {
                    componentId: 'dynamic-standalone',
                    loadComponent: () => import('./standalone/standalone.component').then((m) => m.StandaloneComponent),
                },
                {
                    componentId: 'dynamic-standalone2',
                    loadComponent: () =>
                        import('./standalone/standalone2.component').then((m) => m.Standalone2Component),
                },
                {
                    componentId: 'dynamic-event-load',
                    loadComponent: () =>
                        import('./load-events/event-standalone.component').then((m) => m.EventStandaloneComponent),
                    preload: false,
                },
            ],
        }),
        provideRxDynamicComponentManifests([
            {
                componentId: 'dynamic-idle-standalone',
                loadComponent: () =>
                    import('./idle-load-standalone/idle-load-standalone.component').then(
                        (m) => m.IdleLoadStandaloneComponent
                    ),
            },
            {
                componentId: 'dynamic-module',
                loadChildren: () => import('./dynamic-module/dynamic-module.module').then((m) => m.DynamicModuleModule),
            },
        ]),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
