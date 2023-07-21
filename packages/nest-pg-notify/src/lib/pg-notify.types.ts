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

export type PgNotifyRedisOptions = ConstructorParameters<typeof Redis>;

type PgNotifyRedlockOptions = ConstructorParameters<typeof Redlock>;

export interface PgNotifyConfig {
    pg:
        | Subscriber
        | {
              connectionConfig?: ClientConfig;
              options?: Options;
          };
    ioredis?: Redis | PgNotifyRedisOptions;
    redlock?:
        | Redlock
        | {
              settings?: PgNotifyRedlockOptions[1];
              scripts?: PgNotifyRedlockOptions[2];
          };
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
