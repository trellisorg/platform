import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
    provideRxDynamicComponent,
    provideRxDynamicComponentManifests,
    RxDynamicDirective,
    RxDynamicLoadDirective,
} from '@trellisorg/rx-dynamic-component';
import { AppComponent } from './app.component';
import { StandaloneAdapterDirective } from './standalone/standalone-adapter.directive';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
        RxDynamicLoadDirective,
        StandaloneAdapterDirective,
        MatDialogModule,
        BrowserAnimationsModule,
        RxDynamicDirective,
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
                    componentId: 'dynamic-load-on-click',
                    loadComponent: () => import('./load-on-click.component').then((m) => m.LoadOnClickComponent),
                    preload: false,
                },
            ],
            preload: true,
        }),
        provideRxDynamicComponentManifests([
            {
                componentId: 'dynamic-idle-standalone',
                loadComponent: () =>
                    import('./idle-load-standalone/idle-load-standalone.component').then(
                        (m) => m.IdleLoadStandaloneComponent
                    ),
            },
        ]),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
