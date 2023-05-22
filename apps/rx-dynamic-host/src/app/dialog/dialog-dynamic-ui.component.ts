import { Component, Input } from '@angular/core';

@Component({
    selector: 'tr-dialog-dynamic-ui',
    template: `{{ value }}`,
    standalone: true,
    imports: [],
})
export class DialogDynamicUiComponent {
    @Input() value: number | undefined | null = 0;
}
