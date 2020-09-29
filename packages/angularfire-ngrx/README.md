# @trellisorg/angularfire-ngrx

This library is designed for hooking `angularfire` into an NgRx store so that you can listen on native NgRx actions whenever
angularfire events are emitted.

This library is split into multiple modules similar to AngularFire such that you can only subscribe you actions for different
parts of AngularFire.

Note: This is an alpha version of this package and is subject to change at any time.

Currently supported:

1. Auth

In the works:

1. Cloud Messaging

## Including in your application

In your `AppModule`:

```
import { AngularFireNgrxModule } from '@trellisorg/angularfire-ngrx';

@NgModule({
    imports: [
        // other imports
        AngularFireNgrxModule.forRoot(),
        AngularFireNgrxAuthModule // Optional, this will dispatch AngularFireAuth actions to the store
    ]
})
export class AppModule {}
```

The `.forRoot()` method takes the following config:

```
{
    replay: boolean; // Whether to replay the last emitted value when the effect subscribes to the lifted observable merged from AngularFireAuth events
}
```

## Actions

### AngularFireAuth Actions

The following actions are dispatched based on what AngularFire Auth emits. Typically, named after the corresponding
method in AngularFireAuth service that emits an observable.

```
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
```

### AngularFireMessaging Actions

The following actions are dispatched based on what AngularFire Messaging emits. Typically, named after the corresponding
method in AngularFireMessaging service that emits an observable.

```
export const tokenChanges = createAction(
    '[@angularfire-ngrx/messaging/token-changes] Token Changes',
    props<{ token: string | null }>()
);

// afMessage instead of just message even though the message you would subscribe to is messages
export const afMessage = createAction(
    '[@angularfire-ngrx/messaging/messages] Receive new message from AngularFire Messaging',
    props<{ message: any }>()
);
```

The following actions can be dispatched to trigger methods on AngularFireMessaging. They will trigger effects that then dispatch a success or failed
action.

```
export const requestPermission = createAction(
    '[@angularfire-ngrx/messaging/request-permission] Request Permission for Messaging'
);

export const requestToken = createAction(
    '[@angularfire-ngrx/messaging/request-token] Request a token from AngularFire Messaging'
);
```

Success and Failure Actions for the above:

```
export const requestPermissionSuccess = createAction(
    '[@angularfire-ngrx/messaging/request-permission-success] Request Permission for Messaging Successful'
);

export const requestPermissionFailed = createAction(
    '[@angularfire-ngrx/messaging/request-permission-failed] Request Permission for Messaging Failed',
    props<{ error: any }>()
);

export const requestTokenSuccess = createAction(
    '[@angularfire-ngrx/messaging/request-token-success] Request Token for Messaging Successful',
    props<{ token: string | null }>()
);

export const requestTokenFailed = createAction(
    '[@angularfire-ngrx/messaging/request-token-success] Request Token for Messaging Successful',
    props<{ error: any }>()
);
```

Other actions:

```
export const getToken = createAction(
    '[@angularfire-ngrx/messaging/get-token] Get Token From AngularFire Messaging'
);

export const gotToken = createAction(
    '[@angularfire-ngrx/messaging/got-token] Got Token From AngularFire Messaging',
    props<{ token: string | null }>()
);

export const deleteToken = createAction(
    '[@angularfire-ngrx/messaging/delete-token] Delete Token Associated with this Messaging instance'
);

export const tokenDeleted = createAction(
    '[@angularfire-ngrx/messaging/token-deleted] Whether the token was deleted or not',
    props<{ deleted: boolean }>()
);
```
