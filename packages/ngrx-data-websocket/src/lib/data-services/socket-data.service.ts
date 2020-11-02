import { EntityCollectionDataService, QueryParams } from '@ngrx/data';
import { Observable } from 'rxjs';
import { SocketDispatcherBase } from '../dispatchers/socket-dispatcher-base';
import { Injectable } from '@angular/core';
import { UpdateStr } from '@ngrx/entity/src/models';
import { SocketServiceElementsFactory } from '../socket-services/socket-service-elements.factory';

export class SocketDataService<T> implements EntityCollectionDataService<T> {
    readonly name: string;

    constructor(
        private entityName: string,
        private socketDispatcher: SocketDispatcherBase<T>
    ) {}

    connect(params: any): Observable<void> {
        return this.socketDispatcher.connect();
    }

    add(entity: T): Observable<T> {
        return this.socketDispatcher.add(entity);
    }

    delete(id: number | string): Observable<number | string> {
        return undefined;
    }

    getAll(): Observable<T[]> {
        return undefined;
    }

    getById(id: any): Observable<T> {
        return undefined;
    }

    getWithQuery(params: QueryParams | string): Observable<T[]> {
        return undefined;
    }

    update(update: UpdateStr<T>): Observable<T> {
        return undefined;
    }

    upsert(entity: T): Observable<T> {
        return undefined;
    }
}
