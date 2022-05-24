import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    DynamicOutletModule,
    RxDynamicComponentModule,
} from '@trellisorg/rx-dynamic-component';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        DynamicOutletModule,
        RxDynamicComponentModule.forRoot({
            devMode: true,
            manifests: [
                {
                    componentId: 'dynamic-remote',
                    loadChildren: () =>
                        import('dynamic-remote/Module').then(
                            (m) => m.RemoteEntryModule
                        ),
                },
            ],
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
