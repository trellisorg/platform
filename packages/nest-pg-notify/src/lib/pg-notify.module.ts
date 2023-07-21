import type { Provider } from '@nestjs/common';
import { DynamicModule, Module, ValueProvider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import type { Subscriber } from 'pg-listen';
import { PgNotifyMetadataAccessor } from './pg-notify-metadata-accessor.service';
import { PG_NOTIFY_CONFIG, PG_NOTIFY_SUBSCRIBER } from './pg-notify.constants';
import { PgNotifyExplorer } from './pg-notify.explorer';
import type { PgChannelOptions, PgNotifyAsyncConfiguration, PgNotifyConfig } from './pg-notify.types';
import { createIoredisProvider } from './providers/create-ioredis-provider';
import { createRedlockProvider } from './providers/create-redlock-provider';
import { createSubscriberProvider } from './providers/create-subscriber-provider';
import { getChannelOptionsToken, getChannelToken } from './utils/get-channel-token';

@Module({})
export class PgNotifyModule {
    static forRoot(config: PgNotifyConfig): DynamicModule {
        const sharedPgNotifyConfigProvider: ValueProvider = {
            provide: PG_NOTIFY_CONFIG,
            useValue: config,
        };

        const providers = [sharedPgNotifyConfigProvider, ...PgNotifyModule.createSharedProviders()];

        return {
            module: PgNotifyModule,
            providers,
            exports: providers,
            global: true,
        };
    }

    static forRootAsync(asyncOptions: PgNotifyAsyncConfiguration): DynamicModule {
        const sharedPgNotifyConfigProvider: Provider = {
            ...asyncOptions,
            provide: PG_NOTIFY_CONFIG,
        };

        const providers = [sharedPgNotifyConfigProvider, ...PgNotifyModule.createSharedProviders()];

        return {
            module: PgNotifyModule,
            providers,
            exports: providers,
            global: true,
        };
    }

    static registerChannel(...options: PgChannelOptions[]): DynamicModule {
        return {
            module: PgNotifyModule,
            providers: [
                ...options.map((option) => ({
                    provide: getChannelOptionsToken(option.name),
                    useValue: option,
                })),
                ...options.map((option) => ({
                    provide: getChannelToken(option.name),
                    useFactory: async (subscriber: Subscriber) => {
                        await subscriber.listenTo(option.name);
                    },
                    inject: [PG_NOTIFY_SUBSCRIBER],
                })),
            ],
            imports: [PgNotifyModule.registerCore()],
        };
    }

    private static createSharedProviders(): Provider[] {
        const subscriberProvider = createSubscriberProvider();
        const redisProvider = createIoredisProvider();
        const redlockProvider = createRedlockProvider();

        return [subscriberProvider, redisProvider, redlockProvider];
    }

    private static registerCore(): DynamicModule {
        return {
            global: true,
            module: PgNotifyModule,
            imports: [DiscoveryModule],
            providers: [PgNotifyExplorer, PgNotifyMetadataAccessor],
        };
    }
}
