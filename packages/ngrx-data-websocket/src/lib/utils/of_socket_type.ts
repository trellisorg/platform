import { SocketAction } from '../actions/socket-action-options';
import { ROOT_ACTION_VALUE, SocketOp } from '../actions/socket-op';
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export function ofSocketType<V extends SocketAction>(
    ...allowedActions: Array<SocketOp>
): OperatorFunction<SocketAction, SocketAction> {
    return filter((action: SocketAction) =>
        allowedActions.some((socketOp) => {
            return action.type.includes(ROOT_ACTION_VALUE);
        })
    );
}
