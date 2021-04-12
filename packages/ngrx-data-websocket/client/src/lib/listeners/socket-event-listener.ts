import socketIo, {
    ManagerOptions,
    Socket,
    SocketOptions,
} from 'socket.io-client';
import { SocketActionFactory } from '../actions/socket-action-factory';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgrxDataWebsocketConfig } from '../utils/tokens';
import {
    listeners,
    SocketActionPayload,
    SocketOp,
} from '@trellisorg/ngrx-data-websocket-core';

export class SocketEventListener<T> {
    private _socket: Socket;

    private readonly _entityName: string;

    constructor(
        entityName: string,
        private socketActionFactory: SocketActionFactory,
        private store: Store
    ) {
        this._entityName = entityName;
    }

    setupReservedEvents(): void {
        [SocketOp.CONNECT_ERROR, SocketOp.RECONNECT_ERROR].forEach((event) =>
            this._socket.on(event, (err) =>
                this.store.dispatch(
                    this.socketActionFactory.create<Error>(
                        this._entityName,
                        event,
                        err
                    )
                )
            )
        );

        [
            SocketOp.CONNECT_TIMEOUT,
            SocketOp.RECONNECT_ATTEMPT,
            SocketOp.RECONNECT_FAILED,
        ].forEach((event) =>
            this._socket.on(event, (attempts) =>
                this.store.dispatch(
                    this.socketActionFactory.create<number>(
                        this._entityName,
                        event,
                        attempts
                    )
                )
            )
        );

        [SocketOp.RECONNECT, SocketOp.RECONNECTING].forEach((event) =>
            this._socket.on(event, () =>
                this.store.dispatch(
                    this.socketActionFactory.create<void>(
                        this._entityName,
                        event
                    )
                )
            )
        );
    }

    emit(event: SocketOp, crid: string, data: any): void {
        this._socket.emit(event, {
            correlationId: crid,
            data,
        });
    }

    disconnect(): void {
        this._socket.disconnect();
    }

    connect(
        config: NgrxDataWebsocketConfig,
        connectOpts: Partial<ManagerOptions & SocketOptions>
    ): Observable<boolean> {
        const connected = new BehaviorSubject<boolean>(false);
        const host = config.host ? `${config.host}/` : '';

        this._socket = socketIo(`${host}${this._entityName.toLowerCase()}`, {
            transports: ['websocket', 'polling'],
            ...connectOpts,
        });

        this.setupReservedEvents();

        this._socket.on('connect', () => {
            this.store.dispatch(
                this.socketActionFactory.create<void>(
                    this._entityName,
                    SocketOp.CONNECT
                )
            );
            connected.next(true);
            connected.complete();
        });

        listeners.forEach((event) => {
            this._socket.on(
                event,
                (
                    response: Pick<
                        SocketActionPayload,
                        'data' | 'correlationId'
                    >
                ) => {
                    const { correlationId, data } = response;
                    this.store.dispatch(
                        this.socketActionFactory.create(
                            this._entityName,
                            event,
                            data,
                            {
                                correlationId,
                            }
                        )
                    );
                }
            );
        });

        return connected.asObservable();
    }
}
