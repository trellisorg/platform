import { Injectable } from '@angular/core';
import { SocketDispatcherBase } from '../dispatchers/socket-dispatcher-base';
import { SocketDispatcherFactory } from '../dispatchers/socket-dispatcher-factory';
import { SocketEventListenerFactory } from '../listeners/socket-event-listener-factory';
import { SocketEventListener } from '../listeners/socket-event-listener';
import { SocketDataService } from '../data-services/socket-data.service';
import { EntityDataService } from '@ngrx/data';
import { SocketDataServiceFactory } from '../data-services/socket-data-service-factory';

export interface SocketServiceElements<T> {
    readonly dispatcher: SocketDispatcherBase<T>;
    readonly listener: SocketEventListener<T>;
    readonly dataService: SocketDataService<T>;
    readonly entityName: string;
}

@Injectable()
export class SocketServiceElementsFactory {
    constructor(
        private socketDispatcherFactory: SocketDispatcherFactory,
        private socketEventListenerFactory: SocketEventListenerFactory,
        private socketDataServiceFactory: SocketDataServiceFactory,
        private entityDataService: EntityDataService
    ) {}

    create<T>(entityName: string): SocketServiceElements<T> {
        const dispatcher = this.socketDispatcherFactory.create<T>(entityName);

        const listener = this.socketEventListenerFactory.create<T>(entityName);

        const dataService = this.socketDataServiceFactory.create<T>(
            entityName,
            dispatcher
        );

        this.entityDataService.registerService(entityName, dataService);

        return {
            listener,
            dispatcher,
            entityName,
            dataService,
        };
    }
}
