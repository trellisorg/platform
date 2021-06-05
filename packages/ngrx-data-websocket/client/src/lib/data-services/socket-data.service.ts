import type { EntityCollectionDataService, QueryParams } from '@ngrx/data';
import type { UpdateStr } from '@ngrx/entity/src/models';
import type { Observable } from 'rxjs';
import type { SocketDispatcherBase } from '../dispatchers/socket-dispatcher-base';

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
