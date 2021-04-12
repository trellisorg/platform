import {
    EntityCollectionServiceBase,
    EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { SocketEventListener } from '../listeners/socket-event-listener';
import { SocketServiceElementsFactory } from './socket-service-elements.factory';
import { Observable } from 'rxjs';
import { EntitySelectors$ } from '@ngrx/data/src/selectors/entity-selectors$';
import { ManagerOptions, SocketOptions } from 'socket.io-client';

export class SocketCollectionServiceBase<
    T,
    S$ extends EntitySelectors$<T> = EntitySelectors$<T>
> extends EntityCollectionServiceBase<T, S$> {
    readonly connected$: Observable<boolean>;
    readonly connecting$: Observable<boolean>;
    private readonly listener: SocketEventListener<T>;

    constructor(
        entityName: string,
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        protected socketServiceElementsFactory: SocketServiceElementsFactory<T>
    ) {
        super(entityName, serviceElementsFactory);

        const { listener, selectors$ } = socketServiceElementsFactory.create(
            entityName
        );

        this.connected$ = selectors$.connected$;
        this.connecting$ = selectors$.connecting$;

        this.listener = listener;
    }

    connect(
        connectOpts: Partial<ManagerOptions & SocketOptions>
    ): Observable<boolean> {
        return this.listener.connect(
            this.socketServiceElementsFactory.config,
            connectOpts
        );
    }

    disconnect(): void {
        this.listener.disconnect();
    }
}
