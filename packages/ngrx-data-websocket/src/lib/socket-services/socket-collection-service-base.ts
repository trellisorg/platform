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

  readonly connected$: Observable<boolean>;

  readonly connecting$: Observable<boolean>;

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

  connect(params: any): Observable<boolean> {
    return this.listener.connect(
      this.socketServiceElementsFactory.config,
      params
    );
  }

  disconnect(): void {
    this.listener.disconnect();
  }
}
