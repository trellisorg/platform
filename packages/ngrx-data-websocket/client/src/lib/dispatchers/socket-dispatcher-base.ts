import {
    CorrelationIdGenerator,
    OP_ERROR,
    OP_SUCCESS,
    QueryParams,
} from '@ngrx/data';
import type { UpdateStr } from '@ngrx/entity/src/models';
import type { Action, Store } from '@ngrx/store';
import {
    SocketAction,
    SocketActionOptions,
    SocketOp,
} from '@trellisorg/ngrx-data-websocket-core';
import { Observable, of, throwError } from 'rxjs';
import { filter, mergeMap, take, timeout } from 'rxjs/operators';
import type { SocketActionFactory } from '../actions/socket-action-factory';

export class SocketDispatcherBase<T> {
    constructor(
        private entityName: string,
        private correlationIdGenerator: CorrelationIdGenerator,
        private socketActionFactory: SocketActionFactory,
        private reducedActions$: Observable<Action>,
        private store: Store,
        private socketTimeout: number
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

    private dispatch(action: Action): Action {
        this.store.dispatch(action);
        return action;
    }

    add(entity: T): Observable<T> {
        return this.processEvent(SocketOp.SAVE_ADD_ONE, entity);
    }

    delete(id: number | string): Observable<number | string> {
        return this.processEvent<number | string, number | string>(
            SocketOp.SAVE_DELETE_ONE,
            id
        );
    }

    getAll(): Observable<T[]> {
        return this.processEvent<null, T[]>(SocketOp.QUERY_ALL);
    }

    getById(id: number | string): Observable<T> {
        return this.processEvent<number | string, T>(SocketOp.QUERY_BY_KEY, id);
    }

    getWithQuery(params: QueryParams | string): Observable<T[]> {
        return this.processEvent<QueryParams | string, T[]>(
            SocketOp.QUERY_MANY,
            params
        );
    }

    update(update: UpdateStr<T>): Observable<T> {
        return this.processEvent<UpdateStr<T>, T>(
            SocketOp.SAVE_UPDATE_ONE,
            update
        );
    }

    upsert(entity: T): Observable<T> {
        return this.processEvent<T, T>(SocketOp.SAVE_UPSERT_ONE, entity);
    }

    private processEvent<P, K>(event: SocketOp, data?: P): Observable<K> {
        const correlationId = this.correlationIdGenerator.next();

        const action = this.socketActionFactory.create<P>(
            this.entityName,
            event,
            data,
            { correlationId }
        );

        this.dispatch(action);

        return this.getResponseEventData$<K>(correlationId);
    }

    private getResponseEventData$<D = any>(crid: string): Observable<D> {
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
            timeout(this.socketTimeout),
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
