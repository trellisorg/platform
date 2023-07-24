import type { FactoryProvider } from '@nestjs/common';
import createSubscriber, { Subscriber } from 'pg-listen';
import { PG_NOTIFY_CONFIG, PG_NOTIFY_SUBSCRIBER } from '../pg-notify.constants';
import type { PgNotifyConfig } from '../pg-notify.types';

function isSubscriber(maybeSubscriber: Subscriber | PgNotifyConfig['pg']): maybeSubscriber is Subscriber {
    return typeof maybeSubscriber === 'object' && typeof (maybeSubscriber as Subscriber)['connect'] === 'function';
}

export function createSubscriberProvider(): FactoryProvider {
    return {
        provide: PG_NOTIFY_SUBSCRIBER,
        useFactory: async (config: PgNotifyConfig) => {
            if (isSubscriber(config.pg)) {
                return config.pg;
            }

            const subscriber = createSubscriber(config.pg.connectionConfig, config.pg.options);
            await subscriber.connect();

            return subscriber;
        },
        inject: [PG_NOTIFY_CONFIG],
    };
}
