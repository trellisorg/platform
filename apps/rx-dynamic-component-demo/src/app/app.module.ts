import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
    DynamicOutletModule,
    RxDynamicComponentModule,
} from '@trellisorg/rx-dynamic-component';
import { AppComponent } from './app.component';
import { QueryParam2Module } from './query-param2/query-param2.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RxDynamicComponentModule.forRoot({
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
                },
                /**
                 * Or can be used to reference the module directly
                 */
                {
                    componentId: 'query2',
                    loadChildren: () => QueryParam2Module,
                },
            ],
        }),
        DynamicOutletModule,
        RouterModule.forRoot([]),
        FormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
