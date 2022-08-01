import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'trellisorg-standalone',
    template: `<p>standalone works! Current Input value: {{ name }}</p>`,
    styles: [''],
    standalone: true,
})
export class StandaloneComponent {
    private _name: string | null = '';

    @Input() set name(name: string | null) {
        this._name = name;

        if (name) this.myName.emit(name);
    }

    get name(): string | null {
        return this._name;
    }

    @Output() readonly myName = new EventEmitter<string>();
}
