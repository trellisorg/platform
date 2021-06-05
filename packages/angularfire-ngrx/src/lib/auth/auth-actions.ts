import { createAction, props } from '@ngrx/store';
import type * as firebase from 'firebase';
import type { User } from 'firebase';

export const authStateChanged = createAction(
    '[@angularfire-ngrx/auth/auth-state] Auth State changed',
    props<{ authState: User | null }>()
);

export const idTokenChanged = createAction(
    '[@angularfire-ngrx/auth/id-token] ID Token',
    props<{ idToken: string | null }>()
);

export const userChanged = createAction(
    '[@angularfire-ngrx/auth/user] User',
    props<{ user: User | null }>()
);

export const idTokenResultChanged = createAction(
    '[@angularfire-ngrx/auth/id-token-result] Id Token Result',
    props<{ idTokenResult: firebase.auth.IdTokenResult | null }>()
);
