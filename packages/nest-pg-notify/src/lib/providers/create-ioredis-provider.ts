import type { FactoryProvider } from '@nestjs/common';
import Redis from 'ioredis';
import { PG_NOTIFY_CONFIG, PG_NOTIFY_REDIS } from '../pg-notify.constants';
import type { PgNotifyConfig } from '../pg-notify.types';

export function createIoredisProvider(): FactoryProvider {
    return {
        provide: PG_NOTIFY_REDIS,
        useFactory: (config: PgNotifyConfig) =>
            config.ioredis instanceof Redis ? config.ioredis : new Redis(...(config.ioredis ?? [])),
        inject: [PG_NOTIFY_CONFIG],
    };
}
