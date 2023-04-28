import { Component } from '@angular/core';

@Component({
    selector: 'trellisorg-alive',
    template: `<div class="alive"></div> `,
    styles: [
        `
            .alive {
                width: 100%;
                height: 100%;
                background-color: darkorange;
            }
        `,
    ],
    standalone: true,
})
export class AliveComponent {}
