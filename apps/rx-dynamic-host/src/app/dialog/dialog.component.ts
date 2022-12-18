import { Component } from '@angular/core';
import {
    provideRxDynamicComponentManifests,
    RxDynamicDirective,
    RxDynamicLoadDirective,
} from '@trellisorg/rx-dynamic-component';
import { DialogService } from './dialog.service';

@Component({
    selector: 'tr-dialog',
    template: `<div rxDynamic load="dialog-dynamic"></div>`,
    standalone: true,
    imports: [RxDynamicLoadDirective, RxDynamicDirective],
    providers: [
        provideRxDynamicComponentManifests([
            {
                componentId: 'dialog-dynamic',
                loadComponent: () => import('./dialog-dynamic.component').then((m) => m.DialogDynamicComponent),
            },
        ]),
        DialogService,
    ],
})
export class DialogComponent {}
