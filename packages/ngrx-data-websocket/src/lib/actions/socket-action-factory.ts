import { Injectable } from '@angular/core';
import { SocketOp } from './socket-op';
import { SocketAction, SocketActionOptions } from './socket-action-options';
import { EntityAction, EntityActionFactory, EntityOp } from '@ngrx/data';
import { createActionType } from '../utils/create-action-type';

@Injectable()
export class SocketActionFactory {
  constructor(private entityActionFactory: EntityActionFactory) {}

  create<P = any>(
    entityName: string,
    socketOp: SocketOp,
    data?: P,
    options?: SocketActionOptions
  ): SocketAction {
    return {
      type: createActionType(entityName, socketOp),
      payload: {
        entityName,
        socketOp,
        data,
        ...options,
      },
    };
  }

  convertToDataAction<P = any>(socketAction: SocketAction<P>): EntityAction<P> {
    return this.entityActionFactory.create(
      socketAction.payload.entityName,
      socketAction.payload.socketOp.replace(
        'ngrx-data-websocket',
        '@ngrx/data'
      ) as EntityOp,
      socketAction.payload.data
    );
  }
}
