import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import type { Observable } from 'rxjs';
import { Item, selectData } from './store';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    data$: Observable<Item[]>;

    constructor(private _store: Store) {
        this.data$ = this._store.pipe(select(selectData));
    }
}
