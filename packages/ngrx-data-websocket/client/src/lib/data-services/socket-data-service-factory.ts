import { Injectable } from '@angular/core';
import type { SocketDispatcherBase } from '../dispatchers/socket-dispatcher-base';
import { SocketDataService } from './socket-data.service';

@Injectable()
export class SocketDataServiceFactory {
    create<T>(
        entityName: string,
        dispatcher: SocketDispatcherBase<T>
    ): SocketDataService<T> {
        return new SocketDataService<T>(entityName, dispatcher);
    }
}
