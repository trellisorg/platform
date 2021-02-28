import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectTitle } from './store';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title$: Observable<string>;

    constructor(private _store: Store) {
        this.title$ = this._store.pipe(select(selectTitle));
    }
}
