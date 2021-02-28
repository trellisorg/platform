import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, map, tap } from 'rxjs/operators';
import { SocketEventListenerCollectionService } from '../listeners/socket-event-listener-collection.service';
import { SocketActionFactory } from '../actions/socket-action-factory';
import { ofSocketType } from '../utils/of_socket_type';
import {
    dispatchEvents,
    listeners,
    SocketAction,
    SocketActionPayload,
} from '@trellisorg/ngrx-data-websocket-core';

@Injectable()
export class SocketDispatcherEffects {
    socketEventWithoutCrid$ = createEffect(() =>
        this._actions$.pipe(
            ofSocketType(...listeners),
            filter((action: SocketAction) => !action.payload.correlationId),
            map((action: SocketAction) =>
                this.socketActionFactory.convertToDataAction(action)
            )
        )
    );

    dispatchSocketEvent$ = createEffect(
        () =>
            this._actions$.pipe(
                ofSocketType(...dispatchEvents),
                map((action: SocketAction) => action.payload),
                map((action: SocketActionPayload) => {
                    const listener = this.socketEventListenerCollectionService.get(
                        action.entityName
                    );

                    if (listener) {
                        listener.emit(
                            action.socketOp,
                            action.correlationId,
                            action.data
                        );
                    }

                    return;
                })
            ),
        { dispatch: false }
    );

    constructor(
        private _actions$: Actions,
        private socketEventListenerCollectionService: SocketEventListenerCollectionService,
        private socketActionFactory: SocketActionFactory
    ) {}
}
