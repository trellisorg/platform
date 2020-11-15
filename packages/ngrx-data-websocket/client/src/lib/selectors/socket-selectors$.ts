import { merge, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { createActionType } from '../utils/create-action-type';
import {
    reservedEvents,
    SocketAction,
    SocketOp,
} from '@trellisorg/ngrx-data-websocket-core';

export interface SocketSelectors$<T> {
    readonly connected$: Observable<boolean>;

    readonly connecting$: Observable<boolean>;
}

@Injectable()
export class SocketSelectors$Factory<T> {
    constructor(private store: Store, private actions: Actions<SocketAction>) {}

    create<T>(entityName: string): SocketSelectors$<T> {
        // This will filter actions by only the socket.io reserved events
        const reservedActions$ = this.actions.pipe(
            ofType(
                ...reservedEvents.map((event) =>
                    createActionType(entityName, event)
                )
            )
        );

        // Defaults to true since sockets try to connect right away
        const connectingOrReconnecting: Observable<boolean> = reservedActions$.pipe(
            ofType(createActionType(entityName, SocketOp.RECONNECTING)),
            map(() => true),
            startWith(true),
            shareReplay(1)
        );

        const connectFailed: Observable<boolean> = reservedActions$.pipe(
            ofType(
                ...[
                    SocketOp.CONNECT_ERROR,
                    SocketOp.CONNECT_TIMEOUT,
                    SocketOp.RECONNECT_ERROR,
                    SocketOp.RECONNECT_FAILED,
                ].map((op) => createActionType(entityName, op))
            ),
            map(() => true),
            shareReplay(1)
        );

        const connectOrReconnect: Observable<boolean> = reservedActions$.pipe(
            ofType(
                ...[SocketOp.CONNECT, SocketOp.RECONNECT].map((op) =>
                    createActionType(entityName, op)
                )
            ),
            map(() => true),
            shareReplay(1)
        );

        /**
         * Socket is connected if:
         * CONNECT or RECONNECT has been emitted
         * but not if ERROR or TIMEOUT events emitted
         * and if the socket is not currently connecting
         */
        const connected$: Observable<boolean> = merge(
            connectOrReconnect,
            connectFailed.pipe(map((val) => !val)),
            connectingOrReconnecting.pipe(map((val) => !val))
        );

        /**
         * Currently connecting if initial value is used or RECONNECTING event is emitted
         * but not if it has failed or a CONNECT or RECONNECT event has been emitted
         */
        const connecting$: Observable<boolean> = merge(
            connectingOrReconnecting,
            connectFailed.pipe(map((val) => !val)),
            connectOrReconnect.pipe(map((val) => !val))
        );

        return {
            connected$,
            connecting$,
        };
    }
}
