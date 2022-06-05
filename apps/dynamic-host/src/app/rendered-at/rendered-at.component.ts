import { Component } from '@angular/core';

@Component({
    selector: 'trellisorg-rendered-at',
    template: `<p>I was rendered at: {{ renderedAt }}</p>`,
    styles: [''],
    standalone: true,
})
export class RenderedAtComponent {
    readonly renderedAt = new Date();
}
