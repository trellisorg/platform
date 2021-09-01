import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    DynamicOutletModule,
    RxDynamicComponentModule,
} from '@trellisorg/rx-dynamic-component';
import { DialogComponent } from './dialog.component';
import { Store } from './store';

@NgModule({
    declarations: [DialogComponent],
    imports: [
        CommonModule,
        RxDynamicComponentModule.forFeature([
            {
                componentId: 'lazy',
                loadChildren: () =>
                    import('../lazy/lazy.module').then((m) => m.LazyModule),
            },
        ]),
        DynamicOutletModule,
    ],
    providers: [Store],
})
export class DialogModule {}
