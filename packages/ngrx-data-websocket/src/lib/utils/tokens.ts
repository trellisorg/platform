import { InjectionToken } from '@angular/core';

export interface NgrxDataWebsocketConfig {
  timeout: number;
  host: string;
}

export const defaultNgrxDataWebsocketConfig: NgrxDataWebsocketConfig = {
  timeout: 5000,
  host: '',
};

export const NGRX_DATA_WEBSOCKET_CONFIG = new InjectionToken<
  NgrxDataWebsocketConfig
>('ngrx-websocket-config');
