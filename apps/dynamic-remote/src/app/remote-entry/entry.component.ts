import { Component } from '@angular/core';

@Component({
    selector: 'dynamic-remote-entry',
    template: `<div style="border: black dashed 5px; padding: 5px">
        I am an MFE static remote that is loaded dynamically through
        rx-dynamic-component
    </div>`,
})
export class RemoteEntryComponent {}
