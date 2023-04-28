import { Component } from '@angular/core';

@Component({
    selector: 'trellisorg-dead',
    template: `<div class="dead"></div>`,
    styles: [
        `
            .dead {
                width: 100%;
                height: 100%;
                background-color: black;
            }
        `,
    ],
    standalone: true,
})
export class DeadComponent {}
