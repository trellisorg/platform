import { Injectable } from '@angular/core';
import { SocketOp } from './socket-op';
import { SocketAction, SocketActionOptions } from './socket-action-options';

@Injectable()
export class SocketActionFactory {
    create<P = any>(
        entityName: string,
        socketOp: SocketOp,
        data?: P,
        options?: SocketActionOptions
    ): SocketAction {
        return {
            type: `[${socketOp}] ${entityName}`,
            payload: {
                entityName,
                socketOp,
                data,
                ...options,
            },
        };
    }
}
