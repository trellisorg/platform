import { Action } from '@ngrx/store';
import { SocketOp } from './socket-op';

export interface SocketAction<P = any> extends Action {
    readonly type: string;
    readonly payload: SocketActionPayload<P>;
}

export interface SocketActionOptions {
    readonly correlationId: string;
}

export interface SocketActionPayload<P = any> extends SocketActionOptions {
    readonly entityName: string;
    readonly socketOp: SocketOp;
    readonly data?: P;
}
