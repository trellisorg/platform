import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
    ROOT_ACTION_VALUE,
    SocketAction,
    SocketOp,
} from '@trellisorg/ngrx-data-websocket-core';

export function ofSocketType<V extends SocketAction>(
    ...allowedActions: Array<SocketOp>
): OperatorFunction<SocketAction, SocketAction> {
    return filter((action: SocketAction) =>
        allowedActions.some((socketOp) => {
            return action.type.includes(ROOT_ACTION_VALUE);
        })
    );
}
