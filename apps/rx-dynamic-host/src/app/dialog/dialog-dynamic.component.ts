import { Component } from '@angular/core';
import { PushPipe } from '@ngrx/component';
import { DialogDynamicUiComponent } from './dialog-dynamic-ui.component';
import { DialogService } from './dialog.service';

@Component({
    selector: 'tr-dialog-dynamic',
    template: `<tr-dialog-dynamic-ui [value]="value$ | ngrxPush"></tr-dialog-dynamic-ui>`,
    standalone: true,
    imports: [DialogDynamicUiComponent, PushPipe],
})
export class DialogDynamicComponent {
    value$ = this.dialogService.value$;

    constructor(private dialogService: DialogService) {}
}
