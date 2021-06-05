import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SocketActionFactory } from '../actions/socket-action-factory';
import { SocketEventListener } from './socket-event-listener';

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
