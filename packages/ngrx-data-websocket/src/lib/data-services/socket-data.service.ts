import { EntityCollectionDataService, QueryParams } from '@ngrx/data';
import { Observable } from 'rxjs';
import { SocketDispatcherBase } from '../dispatchers/socket-dispatcher-base';
import { UpdateStr } from '@ngrx/entity/src/models';

export class SocketDataService<T> implements EntityCollectionDataService<T> {
    readonly name: string;

    constructor(
        private entityName: string,
        private socketDispatcher: SocketDispatcherBase<T>
    ) {}

    add(entity: T): Observable<T> {
        return this.socketDispatcher.add(entity);
    }

    delete(id: number | string): Observable<number | string> {
        return this.socketDispatcher.delete(id);
    }

    getAll(): Observable<T[]> {
        return this.socketDispatcher.getAll();
    }

    getById(id: number | string): Observable<T> {
        return this.socketDispatcher.getById(id);
    }

    getWithQuery(params: QueryParams | string): Observable<T[]> {
        return this.socketDispatcher.getWithQuery(params);
    }

    update(update: UpdateStr<T>): Observable<T> {
        return this.socketDispatcher.update(update);
    }

    upsert(entity: T): Observable<T> {
        return this.socketDispatcher.upsert(entity);
    }
}
