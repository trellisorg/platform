import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    DYNAMIC_COMPONENT,
    provideRxDynamicComponentManifests,
} from '@trellisorg/rx-dynamic-component';
import { QueryParam2Component } from './query-param2.component';

@NgModule({
    declarations: [QueryParam2Component],
    exports: [QueryParam2Component],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: QueryParam2Component,
        },
        provideRxDynamicComponentManifests([
            {
                componentId: 'feature-preload',
                loadChildren: () =>
                    import('./feature-preload/feature-preload.module').then(
                        (m) => m.FeaturePreloadModule
                    ),
                preload: false,
            },
        ]),
    ],
})
export class QueryParam2Module {}
