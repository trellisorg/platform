import { Injectable } from '@angular/core';
import { SocketEventListener } from './socket-event-listener';
import { SocketActionFactory } from '../actions/socket-action-factory';
import { Store } from '@ngrx/store';

@Injectable()
export class SocketEventListenerFactory {
  constructor(
    private socketActionFactory: SocketActionFactory,
    private store: Store
  ) {}

  create<T>(entityName: string): SocketEventListener<T> {
    return new SocketEventListener(
      entityName,
      this.socketActionFactory,
      this.store
    );
  }
}
