import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import { Item, loadData, setData } from './store';

@Injectable()
export class Effects {
    loadData$ = createEffect(() =>
        this._actions.pipe(
            ofType(loadData),
            switchMap((action) =>
                this._httpClient
                    .get<Item[]>(`http://localhost:3333`)
                    .pipe(map((data) => setData({ data })))
            )
        )
    );

    constructor(
        private _httpClient: HttpClient,
        private _store: Store,
        private _actions: Actions
    ) {}
}
