import { createAction, props } from '@ngrx/store';
import * as firebase from 'firebase';

/**
 * authState is a JSON representation of the Firebase user
 */
export const authStateChanged = createAction(
    '[@angularfire-ngrx/auth/auth-state] Auth State changed',
    props<{ authState: Object | null }>()
);

export const idTokenChanged = createAction(
    '[@angularfire-ngrx/auth/id-token] ID Token',
    props<{ idToken: string | null }>()
);

/**
 * user is a JSON representation of the Firebase user
 */
export const userChanged = createAction(
    '[@angularfire-ngrx/auth/user] User',
    props<{ user: Object | null }>()
);

export const idTokenResultChanged = createAction(
    '[@angularfire-ngrx/auth/id-token-result] Id Token Result',
    props<{ idTokenResult: firebase.auth.IdTokenResult | null }>()
);
