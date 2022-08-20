import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faker } from '@faker-js/faker';

@Component({
    selector: 'trellisorg-standalone',
    template: `<p>{{ id }} standalone2 works! Current Input value: {{ name }}</p>`,
    styles: [''],
    standalone: true,
})
export class Standalone2Component {
    @Output() readonly myName = new EventEmitter<string>();
    protected id = `component${faker.color.human().toUpperCase()}`;

    private _name: string | null = '';

    get name(): string | null {
        return this._name;
    }

    @Input() set name(name: string | null) {
        this._name = name;

        if (name) {
            setTimeout(() => {
                this.myName.emit(name);
            });
        }
    }
}
