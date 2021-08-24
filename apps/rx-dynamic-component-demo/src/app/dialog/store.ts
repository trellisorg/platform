import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

export interface State {
    name: string;
}

@Injectable()
export class Store extends ComponentStore<State> {
    constructor() {
        super();
        console.log('new store');
    }

    readonly name$ = this.select((state) => state.name);
}
