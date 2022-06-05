import { Component } from '@angular/core';

@Component({
    selector: 'trellisorg-rendered-at2',
    template: `<p>I was rendered at: {{ renderedAt }}</p>`,
    styles: [''],
    standalone: true,
})
export class RenderedAt2Component {
    readonly renderedAt = new Date();
}
