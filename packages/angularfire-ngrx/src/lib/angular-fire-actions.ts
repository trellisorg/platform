import { Injectable } from '@angular/core';
import { merge, Observable, Operator } from 'rxjs';
import { Action } from '@ngrx/store';
import { AngularFireAuth } from '@angular/fire/auth';
import { map, shareReplay } from 'rxjs/operators';
import * as Actions from './actions';
import { AngularFireNgrxConfig } from './config';

@Injectable()
export class AngularFireActions<V = Action> extends Observable<V> {
  constructor(
    private angularFireAuth: AngularFireAuth,
    private config: AngularFireNgrxConfig
  ) {
    super();

    this.source = merge(
      this.angularFireAuth.authState.pipe(
        map((authState) => Actions.authStateChanged({ authState })),
        shareReplay(this.config.replay ? 1 : 0)
      ),
      this.angularFireAuth.idToken.pipe(
        map((idToken) => Actions.idTokenChanged({ idToken })),
        shareReplay(this.config.replay ? 1 : 0)
      ),
      this.angularFireAuth.idTokenResult.pipe(
        map((idTokenResult) => Actions.idTokenResultChanged({ idTokenResult })),
        shareReplay(this.config.replay ? 1 : 0)
      ),
      this.angularFireAuth.user.pipe(
        map((user) => Actions.userChanged({ user })),
        shareReplay(this.config.replay ? 1 : 0)
      )
    );
  }

  lift<R>(operator: Operator<V, R>): Observable<R> {
    const observable = new AngularFireActions<R>(
      this.angularFireAuth,
      this.config
    );
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}
