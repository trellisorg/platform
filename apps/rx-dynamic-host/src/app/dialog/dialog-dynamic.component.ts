import { Component, inject } from '@angular/core';
import { PushModule } from '@ngrx/component';
import { DialogDynamicUiComponent } from './dialog-dynamic-ui.component';
import { DialogService } from './dialog.service';

@Component({
    selector: 'tr-dialog-dynamic',
    template: `<tr-dialog-dynamic-ui [value]="value$ | ngrxPush"></tr-dialog-dynamic-ui>`,
    standalone: true,
    imports: [PushModule, DialogDynamicUiComponent],
})
export class DialogDynamicComponent {
    readonly value$ = inject(DialogService).value$;
}
