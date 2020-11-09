import { ModuleWithProviders, NgModule } from '@angular/core';
import { SocketServiceElementsFactory } from './socket-services/socket-service-elements.factory';
import { SocketDispatcherFactory } from './dispatchers/socket-dispatcher-factory';
import { SocketActionFactory } from './actions/socket-action-factory';
import { SocketEventListenerFactory } from './listeners/socket-event-listener-factory';
import { SocketDataServiceFactory } from './data-services/socket-data-service-factory';
import { SocketEventListenerCollectionService } from './listeners/socket-event-listener-collection.service';
import { EffectsModule, EffectSources } from '@ngrx/effects';
import { SocketDispatcherEffects } from './effects/socket-dispatcher-effects.service';
import {
    defaultNgrxDataWebsocketConfig,
    NGRX_DATA_WEBSOCKET_CONFIG,
    NgrxDataWebsocketConfig,
} from './utils/tokens';
import { SocketSelectors$Factory } from './selectors/socket-selectors$';

@NgModule({
    imports: [EffectsModule],
    providers: [
        SocketServiceElementsFactory,
        SocketDispatcherFactory,
        SocketActionFactory,
        SocketDataServiceFactory,
        SocketEventListenerFactory,
        SocketEventListenerCollectionService,
        SocketDispatcherEffects,
        SocketSelectors$Factory,
    ],
})
export class NgrxDataWebsocketModule {
    constructor(
        private effectsSources: EffectSources,
        private socketDispatcherEffects: SocketDispatcherEffects
    ) {
        this.effectsSources.addEffects(socketDispatcherEffects);
    }

    static forRoot(
        config?: Partial<NgrxDataWebsocketConfig>
    ): ModuleWithProviders<NgrxDataWebsocketModule> {
        return {
            ngModule: NgrxDataWebsocketModule,
            providers: [
                {
                    provide: NGRX_DATA_WEBSOCKET_CONFIG,
                    useValue: {
                        ...defaultNgrxDataWebsocketConfig,
                        ...config,
                    },
                },
            ],
        };
    }
}
