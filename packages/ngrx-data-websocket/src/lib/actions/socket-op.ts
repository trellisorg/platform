export const ROOT_ACTION_VALUE = 'ngrx-data-websocket';

export enum SocketOp {
  CONNECT = 'connect',
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

  SAVE_DELETE_ONE = 'ngrx-data-websocket/save/delete-one',
  SAVE_DELETE_ONE_SUCCESS = 'ngrx-data-websocket/save/delete-one/success',
  SAVE_DELETE_ONE_ERROR = 'ngrx-data-websocket/save/delete-one/error',

  QUERY_ALL = 'ngrx-data-websocket/query-all',
  QUERY_ALL_SUCCESS = 'ngrx-data-websocket/query-all/success',
  QUERY_ALL_ERROR = 'ngrx-data-websocket/query-all/error',

  QUERY_BY_KEY = 'ngrx-data-websocket/query-by-key',
  QUERY_BY_KEY_SUCCESS = 'ngrx-data-websocket/query-by-key/success',
  QUERY_BY_KEY_ERROR = 'ngrx-data-websocket/query-by-key/error',

  QUERY_MANY = 'ngrx-data-websocket/query-many',
  QUERY_MANY_SUCCESS = 'ngrx-data-websocket/query-many/success',
  QUERY_MANY_ERROR = 'ngrx-data-websocket/query-many/error',

  SAVE_UPDATE_ONE = 'ngrx-data-websocket/save/update-one',
  SAVE_UPDATE_ONE_SUCCESS = 'ngrx-data-websocket/save/update-one/success',
  SAVE_UPDATE_ONE_ERROR = 'ngrx-data-websocket/save/update-one/error',

  SAVE_UPSERT_ONE = 'ngrx-data-websocket/save/upsert-one',
  SAVE_UPSERT_ONE_SUCCESS = 'ngrx-data-websocket/save/upsert-one/success',
  SAVE_UPSERT_ONE_ERROR = 'ngrx-data-websocket/save/upsert-one/error',
}

export const reservedEvents: Array<SocketOp> = [
  SocketOp.CONNECT,
  SocketOp.CONNECT_ERROR,
  SocketOp.CONNECT_TIMEOUT,
  SocketOp.RECONNECT,
  SocketOp.RECONNECT_ATTEMPT,
  SocketOp.RECONNECTING,
  SocketOp.RECONNECT_ERROR,
  SocketOp.RECONNECT_FAILED,
];

export const dispatchEvents: Array<SocketOp> = [
  SocketOp.SAVE_ADD_ONE,
  SocketOp.SAVE_DELETE_ONE,
  SocketOp.QUERY_ALL,
  SocketOp.QUERY_BY_KEY,
  SocketOp.QUERY_MANY,
  SocketOp.SAVE_UPDATE_ONE,
  SocketOp.SAVE_UPSERT_ONE,
];

export const listeners: Array<SocketOp> = [
  SocketOp.SAVE_ADD_MANY_SUCCESS,
  SocketOp.SAVE_ADD_MANY_ERROR,

  SocketOp.SAVE_ADD_ONE_SUCCESS,
  SocketOp.SAVE_ADD_ONE_ERROR,

  SocketOp.SAVE_DELETE_ONE_SUCCESS,
  SocketOp.SAVE_DELETE_ONE_ERROR,

  SocketOp.QUERY_ALL_SUCCESS,
  SocketOp.QUERY_ALL_ERROR,

  SocketOp.QUERY_BY_KEY_SUCCESS,
  SocketOp.QUERY_BY_KEY_ERROR,

  SocketOp.QUERY_MANY_SUCCESS,
  SocketOp.QUERY_MANY_ERROR,

  SocketOp.SAVE_UPDATE_ONE_SUCCESS,
  SocketOp.SAVE_UPDATE_ONE_ERROR,

  SocketOp.SAVE_UPSERT_ONE_SUCCESS,
  SocketOp.SAVE_UPSERT_ONE_ERROR,
];
