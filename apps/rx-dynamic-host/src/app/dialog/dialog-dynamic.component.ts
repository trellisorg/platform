import { Component } from '@angular/core';
import { PushModule } from '@ngrx/component';
import { DialogDynamicComponentUi } from './dialog-dynamic-ui.component';
import { DialogService } from './dialog.service';

@Component({
    selector: 'tr-dialog-dynamic',
    template: `<tr-dialog-dynamic-ui [value]="value$ | ngrxPush"></tr-dialog-dynamic-ui>`,
    standalone: true,
    imports: [DialogDynamicComponentUi, PushModule],
})
export class DialogDynamicComponent {
    value$ = this.dialogService.value$;

    constructor(private dialogService: DialogService) {}
}
