import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    DynamicOutletModule,
    provideRxDynamicComponentManifests,
} from '@trellisorg/rx-dynamic-component';
import { DialogComponent } from './dialog.component';
import { Store } from './store';

@NgModule({
    declarations: [DialogComponent],
    imports: [CommonModule, DynamicOutletModule],
    providers: [
        Store,
        provideRxDynamicComponentManifests([
            {
                componentId: 'lazy',
                loadChildren: () =>
                    import('../lazy/lazy.module').then((m) => m.LazyModule),
            },
        ]),
    ],
})
export class DialogModule {}
