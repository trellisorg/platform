import { createAction, props } from '@ngrx/store';
import * as firebase from 'firebase';
import { User } from 'firebase';

export const authStateChanged = createAction(
    '[@angularfire/auth-state] Auth State changed',
    props<{ authState: User | null }>()
);

export const idTokenChanged = createAction(
    '[@angularfire/id-token] ID Token',
    props<{ idToken: string | null }>()
);

export const userChanged = createAction(
    '[@angularfire/user] User',
    props<{ user: User | null }>()
);

export const idTokenResultChanged = createAction(
    '[@Angularfire/id-token-result] Id Token Result',
    props<{ idTokenResult: firebase.auth.IdTokenResult | null }>()
);
