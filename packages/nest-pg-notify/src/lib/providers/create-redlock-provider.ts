import type { FactoryProvider } from '@nestjs/common';
import type Redis from 'ioredis';
import Redlock from 'redlock';
import { PG_NOTIFY_CONFIG, PG_NOTIFY_REDIS, PG_NOTIFY_REDLOCK } from '../pg-notify.constants';
import type { PgNotifyConfig } from '../pg-notify.types';

export function createRedlockProvider(): FactoryProvider {
    return {
        provide: PG_NOTIFY_REDLOCK,
        useFactory: (ioredisClient: Redis, config: PgNotifyConfig) =>
            config.redlock instanceof Redlock
                ? config.redlock
                : new Redlock([ioredisClient], config.redlock?.settings, config.redlock?.scripts),
        inject: [PG_NOTIFY_REDIS, PG_NOTIFY_CONFIG],
    };
}
