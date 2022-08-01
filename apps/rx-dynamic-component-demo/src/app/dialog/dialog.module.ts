import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    provideRxDynamicComponentManifests,
    RxDynamicDirective,
} from '@trellisorg/rx-dynamic-component';
import { DialogComponent } from './dialog.component';
import { Store } from './store';

@NgModule({
    declarations: [DialogComponent],
    imports: [CommonModule, RxDynamicDirective],
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
