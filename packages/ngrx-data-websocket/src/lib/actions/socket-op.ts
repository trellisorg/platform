export enum SocketOp {
    CONNECT_ERROR = 'connect_error',
    CONNECT_TIMEOUT = 'connect_timeout',
    RECONNECT = 'reconnect',
    RECONNECT_ATTEMPT = 'reconnect_attempt',
    RECONNECTING = 'reconnecting',
    RECONNECT_ERROR = 'reconnect_error',
    RECONNECT_FAILED = 'reconnect_failed',
    SAVE_ADD_MANY = 'ngrx-data-websocket/save/add-many',
    SAVE_ADD_MANY_ERROR = 'ngrx-data-websocket/save/add-many/error',
    SAVE_ADD_MANY_SUCCESS = 'ngrx-data-websocket/save/add-many/success',

    SAVE_ADD_ONE = 'ngrx-data-websocket/save/add-one',
    SAVE_ADD_ONE_ERROR = 'ngrx-data-websocket/save/add-one/error',
    SAVE_ADD_ONE_SUCCESS = 'ngrx-data-websocket/save/add-one/success',
}

export const reservedEvents: Array<SocketOp> = [
    SocketOp.CONNECT_ERROR,
    SocketOp.CONNECT_TIMEOUT,
    SocketOp.RECONNECT,
    SocketOp.RECONNECT_ATTEMPT,
    SocketOp.RECONNECTING,
    SocketOp.RECONNECT_ERROR,
    SocketOp.RECONNECT_FAILED,
];

export const listeners: Array<SocketOp> = [
    SocketOp.SAVE_ADD_MANY_SUCCESS,
    SocketOp.SAVE_ADD_MANY_ERROR,
    SocketOp.SAVE_ADD_ONE_SUCCESS,
    SocketOp.SAVE_ADD_ONE_ERROR,
];
