import type { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import type Redis from 'ioredis';
import type { ClientConfig } from 'pg';
import type { Options, Subscriber } from 'pg-listen';
import type Redlock from 'redlock';

export interface PgNotificationOptions {
    eventIdKey?: string | ((payload: any) => string | number);
    type: string | ((payload: any) => boolean);
    lockExpiry?: number;
    notificationProcessedExpiry?: number;
}

export interface PgChannelOptions {
    name: string;
}

// pg/pg-notify
export type PgOptions = {
    connectionConfig?: ClientConfig;
    options?: Options;
};

export type PgConfig = Subscriber | PgOptions;

// Redis
export type PgNotifyRedisOptions = ConstructorParameters<typeof Redis>;

export type PgNotifyRedisConfig = Redis | PgNotifyRedisOptions;

// Redlock
type RelockConstructorParams = ConstructorParameters<typeof Redlock>;

export type PgNotifyRedlockOptions = {
    settings?: RelockConstructorParams[1];
    scripts?: RelockConstructorParams[2];
};

export type PgNotifyRedlockConfig = Redlock | PgNotifyRedlockOptions;

export interface PgNotifyConfig {
    pg: PgConfig;
    ioredis?: PgNotifyRedisConfig;
    redlock?: PgNotifyRedlockConfig;
}

export type PgNotifyAsyncConfiguration = Pick<ModuleMetadata, 'imports'> &
    (
        | { useExisting: Type<PgNotifyConfig> }
        | { useClass: Type<PgNotifyConfig> }
        | {
              useFactory: (...args: any[]) => Promise<PgNotifyConfig> | PgNotifyConfig;
              inject?: FactoryProvider['inject'];
          }
    );
