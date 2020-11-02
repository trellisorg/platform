import { CorrelationIdGenerator, OP_ERROR, OP_SUCCESS } from '@ngrx/data';
import { SocketActionFactory } from '../actions/socket-action-factory';
import { SocketOp } from '../actions/socket-op';
import {
    SocketAction,
    SocketActionOptions,
} from '../actions/socket-action-options';
import { Observable, of, throwError } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { filter, mergeMap, take } from 'rxjs/operators';

export class SocketDispatcherBase<T> {
    constructor(
        private entityName: string,
        private correlationIdGenerator: CorrelationIdGenerator,
        private socketActionFactory: SocketActionFactory,
        private reducedActions$: Observable<Action>,
        private store: Store
    ) {}

    createSocketAction<P = any>(
        socketOp: SocketOp,
        data?: P,
        options?: SocketActionOptions
    ): SocketAction<P> {
        return this.socketActionFactory.create(
            this.entityName,
            socketOp,
            data,
            options
        );
    }

    dispatch(action: Action): Action {
        this.store.dispatch(action);
        return action;
    }

    add(entity: T): Observable<T> {
        const correlationId = this.correlationIdGenerator.next();

        const action = this.socketActionFactory.create(
            this.entityName,
            SocketOp.SAVE_ADD_ONE,
            entity,
            { correlationId }
        );

        this.dispatch(action);

        return this.getResponseEventData$(correlationId);
    }

    getResponseEventData$<D = any>(crid: string): Observable<D> {
        return this.reducedActions$.pipe(
            filter((act: any) => !!act.payload),
            filter((act: SocketAction) => {
                const { correlationId, entityName, socketOp } = act.payload;
                return (
                    entityName === this.entityName &&
                    correlationId === crid &&
                    (socketOp.endsWith(OP_SUCCESS) ||
                        socketOp.endsWith(OP_ERROR))
                );
            }),
            take(1),
            mergeMap((act) => {
                const { socketOp } = act.payload;
                return socketOp.endsWith(OP_SUCCESS)
                    ? of(act.payload.data as D)
                    : throwError(act.payload.data.error);
            })
        );
    }
}
