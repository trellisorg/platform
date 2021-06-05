import { Injectable } from '@angular/core';
import type { SocketEventListener } from './socket-event-listener';

@Injectable()
export class SocketEventListenerCollectionService {
    private readonly listeners: Map<string, SocketEventListener<any>>;

    constructor() {
        this.listeners = new Map<string, SocketEventListener<any>>();
    }

    register<T>(entityName: string, listener: SocketEventListener<T>): void {
        this.listeners.set(entityName, listener);
    }

    get<T>(entityName: string): SocketEventListener<T> | null {
        return this.listeners.get(entityName);
    }
}
