import { Socket } from 'socket.io';
import { SocketEventBody, SocketEventReturn } from '../types/socket-events';
import {
    SocketOp,
    SocketUpdateResponsePayload,
    SocketUpdateRequestPayload,
} from '@trellisorg/ngrx-data-websocket-core';

export interface SocketEntityGatewayBase<T> {
    queryAll(
        body: SocketEventBody<void>,
        client: Socket
    ):
        | SocketEventReturn<SocketOp.QUERY_ALL_SUCCESS, T[]>
        | Promise<SocketEventReturn<SocketOp.QUERY_ALL_SUCCESS, T[]>>;

    addOne(
        body: SocketEventBody<T>,
        client: Socket
    ):
        | SocketEventReturn<SocketOp.SAVE_ADD_ONE_SUCCESS, T>
        | Promise<SocketEventReturn<SocketOp.SAVE_ADD_ONE_SUCCESS, T>>;

    updateOne(
        body: SocketEventBody<SocketUpdateRequestPayload<T>>,
        client: Socket
    ):
        | SocketEventReturn<
              SocketOp.SAVE_UPDATE_ONE_SUCCESS,
              SocketUpdateResponsePayload<T>
          >
        | Promise<
              SocketEventReturn<
                  SocketOp.SAVE_UPDATE_ONE_SUCCESS,
                  SocketUpdateResponsePayload<T>
              >
          >;

    saveAddMany(
        body: SocketEventBody<T[]>,
        client: Socket
    ):
        | SocketEventReturn<SocketOp.SAVE_ADD_MANY_SUCCESS, T[]>
        | Promise<SocketEventReturn<SocketOp.SAVE_ADD_MANY_SUCCESS, T[]>>;

    queryByKey(
        body: SocketEventBody<string | number>,
        client: Socket
    ):
        | SocketEventReturn<SocketOp.QUERY_BY_KEY_SUCCESS, T>
        | Promise<SocketEventReturn<SocketOp.QUERY_BY_KEY_SUCCESS, T>>;

    queryMany(
        body: SocketEventBody<Record<string, string>>,
        client: Socket
    ):
        | SocketEventReturn<SocketOp.QUERY_MANY_SUCCESS, T[]>
        | Promise<SocketEventReturn<SocketOp.QUERY_MANY_SUCCESS, T[]>>;

    upsertOne(
        body: SocketEventBody<T>,
        client: Socket
    ):
        | SocketEventReturn<SocketOp.SAVE_UPSERT_ONE_SUCCESS, T>
        | Promise<SocketEventReturn<SocketOp.SAVE_UPSERT_ONE_SUCCESS, T>>;

    deleteOne(
        body: SocketEventBody<string | number>,
        client: Socket
    ):
        | SocketEventReturn<SocketOp.SAVE_DELETE_ONE_SUCCESS, string | number>
        | Promise<
              SocketEventReturn<
                  SocketOp.SAVE_DELETE_ONE_SUCCESS,
                  string | number
              >
          >;
}
