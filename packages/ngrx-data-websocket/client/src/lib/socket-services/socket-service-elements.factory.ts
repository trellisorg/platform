import { Inject, Injectable } from '@angular/core';
import { EntityDataService } from '@ngrx/data';
import { SocketDataServiceFactory } from '../data-services/socket-data-service-factory';
import type { SocketDataService } from '../data-services/socket-data.service';
import type { SocketDispatcherBase } from '../dispatchers/socket-dispatcher-base';
import { SocketDispatcherFactory } from '../dispatchers/socket-dispatcher-factory';
import type { SocketEventListener } from '../listeners/socket-event-listener';
import { SocketEventListenerCollectionService } from '../listeners/socket-event-listener-collection.service';
import { SocketEventListenerFactory } from '../listeners/socket-event-listener-factory';
import {
    SocketSelectors$,
    SocketSelectors$Factory,
} from '../selectors/socket-selectors$';
import {
    NgrxDataWebsocketConfig,
    NGRX_DATA_WEBSOCKET_CONFIG,
} from '../utils/tokens';

export interface SocketServiceElements<T> {
    readonly dispatcher: SocketDispatcherBase<T>;
    readonly listener: SocketEventListener<T>;
    readonly dataService: SocketDataService<T>;
    readonly selectors$: SocketSelectors$<T>;
    readonly entityName: string;
}

@Injectable()
export class SocketServiceElementsFactory<T> {
    constructor(
        @Inject(NGRX_DATA_WEBSOCKET_CONFIG)
        public config: NgrxDataWebsocketConfig,
        private socketDispatcherFactory: SocketDispatcherFactory,
        private socketEventListenerFactory: SocketEventListenerFactory,
        private socketDataServiceFactory: SocketDataServiceFactory,
        private entityDataService: EntityDataService,
        private socketEventListenerCollectionService: SocketEventListenerCollectionService,
        private socketSelectors$Factory: SocketSelectors$Factory<T>
    ) {}

    create<T>(entityName: string): SocketServiceElements<T> {
        const dispatcher = this.socketDispatcherFactory.create<T>(entityName);

        const listener = this.socketEventListenerFactory.create<T>(entityName);

        const selectors$ = this.socketSelectors$Factory.create<T>(entityName);

        this.socketEventListenerCollectionService.register<T>(
            entityName,
            listener
        );

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
            selectors$,
        };
    }
}
