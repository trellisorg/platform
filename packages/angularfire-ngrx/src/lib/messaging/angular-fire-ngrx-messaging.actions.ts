import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { Action } from '@ngrx/store';
import { merge, Observable, Operator } from 'rxjs';
import { map } from 'rxjs/operators';
import { afMessage, tokenChanges } from './messaging-actions';

@Injectable({
    providedIn: 'root',
})
export class AngularFireNgrxMessagingActions<V = Action> extends Observable<V> {
    constructor(private angularFireMessaging: AngularFireMessaging) {
        super();

        this.source = merge(
            this.angularFireMessaging.tokenChanges.pipe(
                map((token) => tokenChanges({ token }))
            ),
            this.angularFireMessaging.messages.pipe(
                map((message) => afMessage({ message }))
            )
        );
    }

    lift<R>(operator: Operator<V, R>): Observable<R> {
        const observable = new AngularFireNgrxMessagingActions<R>(
            this.angularFireMessaging
        );

        observable.source = this;
        observable.operator = operator;
        return observable;
    }
}
