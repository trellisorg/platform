import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { interval, Observable, tap } from 'rxjs';

@Injectable()
export class DialogService extends ComponentStore<{ value: number }> {
    setValue = this.updater((state, value: number) => ({
        ...state,
        value,
    }));

    value$ = this.select((state) => state.value);

    readonly value = this.effect((origin$: Observable<number>) => origin$.pipe(tap((value) => this.setValue(value))));

    constructor() {
        super({ value: 0 });

        this.value(interval(2000));
    }
}
