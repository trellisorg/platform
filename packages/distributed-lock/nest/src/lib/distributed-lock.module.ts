import type { ModuleMetadata } from '@nestjs/common';
import { Global, Module, type DynamicModule, type Provider } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { DISTRIBUTED_LOCK_CONFIG, type DistributedLockConfig } from './distributed-lock.config';
import { getLockToken } from './get-lock-token';

export interface NamedDistributedLockConfig<T> {
    name: string;
    options: DistributedLockConfig<T>;
}

@Global()
@Module({})
export class DistributedLockConfigModule {
    private static createLock<T>(
        name: string,
        options: DistributedLockConfig<T>,
    ): { providers: Provider[]; exports: ModuleMetadata['exports'] } {
        const configToken = DISTRIBUTED_LOCK_CONFIG(name);

        return {
            providers: [
                {
                    provide: configToken,
                    useValue: options.config,
                },
                {
                    provide: getLockToken(name),
                    useValue: options.adapter(options.config),
                },
            ],
            exports: [configToken, DistributedLock],
        };
    }

    static forRoot<T>(moduleOptions: NamedDistributedLockConfig<unknown>[] | DistributedLockConfig<T>): DynamicModule {
        let providers: Provider[] = [];
        let exports: ModuleMetadata['exports'] = [];

        if (Array.isArray(moduleOptions)) {
            for (const { options, name } of moduleOptions) {
                const created = DistributedLockConfigModule.createLock(name, options);

                providers.push(...created.providers);
                exports.push(...(created.exports ?? []));
            }
        } else {
            ({ providers, exports = [] } = DistributedLockConfigModule.createLock('root', moduleOptions));

            providers.push({
                provide: DistributedLock,
                useExisting: getLockToken('root'),
            });
            exports.push(DistributedLock);
        }

        return {
            global: true,
            module: DistributedLockConfigModule,
            providers,
            exports,
        };
    }
}

@Module({})
export class DistributedLockModule {
    static forRoot<T>(moduleOptions: NamedDistributedLockConfig<unknown>[] | DistributedLockConfig<T>): DynamicModule {
        return DistributedLockConfigModule.forRoot(moduleOptions);
    }
}
