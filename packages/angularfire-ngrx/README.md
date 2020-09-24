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
```
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
```
