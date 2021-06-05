import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule, EffectSources } from '@ngrx/effects';
import { SocketActionFactory } from './actions/socket-action-factory';
import { SocketDataServiceFactory } from './data-services/socket-data-service-factory';
import { SocketDispatcherFactory } from './dispatchers/socket-dispatcher-factory';
import { SocketDispatcherEffects } from './effects/socket-dispatcher-effects.service';
import { SocketEventListenerCollectionService } from './listeners/socket-event-listener-collection.service';
import { SocketEventListenerFactory } from './listeners/socket-event-listener-factory';
import { SocketSelectors$Factory } from './selectors/socket-selectors$';
import { SocketServiceElementsFactory } from './socket-services/socket-service-elements.factory';
import {
    defaultNgrxDataWebsocketConfig,
    NgrxDataWebsocketConfig,
    NGRX_DATA_WEBSOCKET_CONFIG,
} from './utils/tokens';

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
export class NgrxDataWebsocketClientModule {
    constructor(
        private effectsSources: EffectSources,
        private socketDispatcherEffects: SocketDispatcherEffects
    ) {
        this.effectsSources.addEffects(socketDispatcherEffects);
    }

    static forRoot(
        config?: Partial<NgrxDataWebsocketConfig>
    ): ModuleWithProviders<NgrxDataWebsocketClientModule> {
        return {
            ngModule: NgrxDataWebsocketClientModule,
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
