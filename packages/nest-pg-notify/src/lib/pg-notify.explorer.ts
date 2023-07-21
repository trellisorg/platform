import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import Redis from 'ioredis';
import type { Subscriber } from 'pg-listen';
import Redlock from 'redlock';
import { PgNotifyMetadataAccessor } from './pg-notify-metadata-accessor.service';
import { PG_NOTIFY_REDIS, PG_NOTIFY_REDLOCK, PG_NOTIFY_SUBSCRIBER } from './pg-notify.constants';
import type { PgNotificationOptions } from './pg-notify.types';
import { createProcessedNotificationKey } from './utils/create-processed-notification-key';

@Injectable()
export class PgNotifyExplorer implements OnModuleInit {
    private readonly logger = new Logger('PgNotifyExplorer');

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly discoveryService: DiscoveryService,
        private readonly metadataAccessor: PgNotifyMetadataAccessor,
        private readonly metadataScanner: MetadataScanner,
        @Inject(PG_NOTIFY_REDLOCK) private readonly redlock: Redlock,
        @Inject(PG_NOTIFY_SUBSCRIBER) private readonly subscriber: Subscriber,
        @Inject(PG_NOTIFY_REDIS) private readonly redis: Redis
    ) {}

    onModuleInit(): void {
        this.explore();
    }

    private explore(): void {
        const providers: InstanceWrapper[] = this.discoveryService.getProviders().filter((wrapper) =>
            this.metadataAccessor.isChannel(
                // See {@link https://github.com/nestjs/bull/blob/master/packages/bull/lib/bull.explorer.ts#L38}
                !wrapper.metatype || wrapper.inject ? wrapper.instance?.constructor : wrapper.metatype
            )
        );

        providers.forEach((wrapper) => {
            const { instance, metatype } = wrapper;

            const isRequestScoped = !wrapper.isDependencyTreeStatic();

            if (isRequestScoped) {
                this.logger.error(`Instance is request scoped. Channels cannot be scoped to requests.`);
            } else {
                const { name: channelName } = this.metadataAccessor.getChannelMetadata(
                    // NOTE: We are relying on `instance.constructor` to properly support
                    // `useValue` and `useFactory` providers besides `useClass`.
                    instance.constructor || metatype
                );

                const methodNames = this.metadataScanner.getAllMethodNames(instance);

                for (const key of methodNames) {
                    if (this.metadataAccessor.isNotification(instance[key])) {
                        const metadata = this.metadataAccessor.getNotificationMetadata(instance[key]);

                        this.handleNotification(instance, key, metadata, channelName);
                    }
                }
            }
        });
    }

    private handleNotification(
        instance: any,
        key: string,
        { type, lockExpiry, eventIdKey }: PgNotificationOptions,
        channelName: string
    ): void {
        if (!channelName) {
            throw new Error(`Invalid channel name configured for ${key}, must be a non-empty string.`);
        } else if (type == null) {
            throw new Error(`Invalid type configured for ${key}, must be a string or function.`);
        }

        this.subscriber.notifications.on(channelName, async (payload) => {
            if (
                (typeof type === 'string' && payload['type'] === type) ||
                (typeof type === 'function' && type(payload))
            ) {
                if (!eventIdKey) {
                    instance[key].apply(instance, [payload]);
                } else {
                    const lock = await this.redlock.acquire([payload.id], lockExpiry ?? 5000);

                    const eventId = typeof eventIdKey === 'string' ? payload[eventIdKey] : eventIdKey(payload);

                    try {
                        const hasBeenProcessed = await this.redis.sismember(
                            createProcessedNotificationKey(eventId),
                            payload.eventId
                        );

                        if (hasBeenProcessed === 0) {
                            await instance[key].apply(instance, [payload]);

                            // Make payload eventId a fn or key that can be provided, if empty do not lock or track
                            await this.redis.set(
                                createProcessedNotificationKey(eventId),
                                payload.eventId,
                                'EX',
                                60_000
                            );
                        }
                    } finally {
                        await lock.release();
                    }
                }
            }
        });
    }
}
