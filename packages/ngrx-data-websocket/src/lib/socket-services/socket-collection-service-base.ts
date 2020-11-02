import {
    EntityCollectionServiceBase,
    EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { SocketEventListener } from '../listeners/socket-event-listener';
import { SocketServiceElementsFactory } from './socket-service-elements.factory';
import { Observable } from 'rxjs';
import { EntitySelectors$ } from '@ngrx/data/src/selectors/entity-selectors$';

export class SocketCollectionServiceBase<
    T,
    S$ extends EntitySelectors$<T> = EntitySelectors$<T>
> extends EntityCollectionServiceBase<T, S$> {
    private readonly listener: SocketEventListener<T>;

    constructor(
        entityName: string,
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        socketServiceElementsFactory: SocketServiceElementsFactory
    ) {
        super(entityName, serviceElementsFactory);

        const { listener } = socketServiceElementsFactory.create(entityName);

        this.listener = listener;
    }

    connect(params: any): Observable<void> {
        return this.listener.connect(params);
    }

    disconnect(): void {
        this.listener.disconnect();
    }
}
