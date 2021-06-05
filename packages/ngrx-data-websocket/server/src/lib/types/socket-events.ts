import type { SocketOp } from '@trellisorg/ngrx-data-websocket-core';

export interface SocketEventReturn<op extends SocketOp, T> {
    event: op;
    data: { correlationId: string; data: T };
}

export interface SocketEventBody<T> {
    correlationId: string;
    data: T;
}
