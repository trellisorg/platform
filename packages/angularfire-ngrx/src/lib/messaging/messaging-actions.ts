import { createAction, props } from '@ngrx/store';

export const requestPermission = createAction(
    '[@angularfire-ngrx/messaging/request-permission] Request Permission for Messaging'
);

export const requestPermissionSuccess = createAction(
    '[@angularfire-ngrx/messaging/request-permission-success] Request Permission for Messaging Successful'
);

export const requestPermissionFailed = createAction(
    '[@angularfire-ngrx/messaging/request-permission-failed] Request Permission for Messaging Failed',
    props<{ error: any }>()
);

export const getToken = createAction(
    '[@angularfire-ngrx/messaging/get-token] Get Token From AngularFire Messaging'
);

export const gotToken = createAction(
    '[@angularfire-ngrx/messaging/got-token] Got Token From AngularFire Messaging',
    props<{ token: string | null }>()
);

export const tokenChanges = createAction(
    '[@angularfire-ngrx/messaging/token-changes] Token Changes',
    props<{ token: string | null }>()
);

export const afMessage = createAction(
    '[@angularfire-ngrx/messaging/messages] Receive new message from AngularFire Messaging',
    props<{ message: any }>()
);

export const requestToken = createAction(
    '[@angularfire-ngrx/messaging/request-token] Request a token from AngularFire Messaging'
);

export const requestTokenSuccess = createAction(
    '[@angularfire-ngrx/messaging/request-token-success] Request Token for Messaging Successful',
    props<{ token: string | null }>()
);

export const requestTokenFailed = createAction(
    '[@angularfire-ngrx/messaging/request-token-success] Request Token for Messaging Failed',
    props<{ error: any }>()
);

export const deleteToken = createAction(
    '[@angularfire-ngrx/messaging/delete-token] Delete Token Associated with this Messaging instance'
);

export const tokenDeleted = createAction(
    '[@angularfire-ngrx/messaging/token-deleted] Whether the token was deleted or not',
    props<{ deleted: boolean }>()
);
