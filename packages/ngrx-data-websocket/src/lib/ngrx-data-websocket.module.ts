import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketServiceElementsFactory } from './socket-services/socket-service-elements.factory';
import { SocketDispatcherFactory } from './dispatchers/socket-dispatcher-factory';
import { SocketActionFactory } from './actions/socket-action-factory';
import { SocketEventListenerFactory } from './listeners/socket-event-listener-factory';
import { SocketDataServiceFactory } from './data-services/socket-data-service-factory';

@NgModule({
    imports: [CommonModule],
    providers: [
        SocketServiceElementsFactory,
        SocketDispatcherFactory,
        SocketActionFactory,
        SocketDataServiceFactory,
        SocketEventListenerFactory,
    ],
})
export class NgrxDataWebsocketModule {}
