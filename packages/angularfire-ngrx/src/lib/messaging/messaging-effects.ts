import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AngularFireNgrxMessagingActions } from './angular-fire-ngrx-messaging.actions';
import { createEffect, ofType } from '@ngrx/effects';
import {
    deleteToken,
    getToken,
    gotToken,
    requestPermission,
    requestPermissionFailed,
    requestPermissionSuccess,
    requestToken,
    requestTokenFailed,
    requestTokenSuccess,
    tokenDeleted,
} from './messaging-actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagingEffects {
    allActions$ = createEffect(() => this.angularFireNgrxMessagingActions);

    requestPermission$ = createEffect(() =>
        this._store.pipe(
            ofType(requestPermission),
            switchMap(() => this.angularFireMessaging.requestPermission),
            map(() => requestPermissionSuccess()),
            catchError((error) => of(requestPermissionFailed({ error })))
        )
    );

    getToken$ = createEffect(() =>
        this._store.pipe(
            ofType(getToken),
            switchMap(() => this.angularFireMessaging.getToken),
            map((token) => gotToken({ token }))
        )
    );

    requestToken$ = createEffect(() =>
        this._store.pipe(
            ofType(requestToken),
            switchMap(() => this.angularFireMessaging.requestToken),
            map((token) => requestTokenSuccess({ token })),
            catchError((error) => of(requestTokenFailed({ error })))
        )
    );

    tokenDeleted$ = createEffect(() =>
        this._store.pipe(
            ofType(deleteToken),
            switchMap(() => this.angularFireMessaging.getToken),
            switchMap((token) => this.angularFireMessaging.deleteToken(token)),
            map((deleted) => tokenDeleted({ deleted })),
            catchError(() => of(tokenDeleted({ deleted: false })))
        )
    );

    constructor(
        private _store: Store,
        private angularFireNgrxMessagingActions: AngularFireNgrxMessagingActions,
        private angularFireMessaging: AngularFireMessaging
    ) {}
}
