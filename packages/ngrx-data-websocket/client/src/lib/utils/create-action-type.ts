import type { SocketOp } from '@trellisorg/ngrx-data-websocket-core';

export function createActionType(entityName: string, op: SocketOp): string {
    return `[${entityName}] ${op}`;
}
