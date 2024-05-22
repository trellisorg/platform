import {
    Global,
    Module,
    type DynamicModule,
    type FactoryProvider,
    type ModuleMetadata,
    type Provider,
} from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import {
    DISTRIBUTED_LOCK_CONFIG,
    type DistributedLockConfig,
    type InheritDistributedLockConfig,
} from './distributed-lock.config';
import { getLockToken } from './get-lock-token';

@Global()
@Module({})
export class DistributedLockConfigModule {
    private static createLock<T>({
        configToken,
        name,
    }: {
        configToken: string;
        name: string;
    }): Required<Pick<ModuleMetadata, 'exports' | 'providers'>> {
        const providerToken = getLockToken(name);

        const metadata: Required<Pick<ModuleMetadata, 'exports' | 'providers'>> = {
            providers: [
                {
                    provide: providerToken,
                    useFactory: (configFromDi: DistributedLockConfig<T>) => configFromDi.adapter(configFromDi.config),
                    inject: [configToken],
                },
            ],
            exports: [providerToken],
        };

        if (name === 'root') {
            metadata.providers?.push({
                provide: DistributedLock,
                useExisting: providerToken,
            });
            metadata.exports?.push(DistributedLock);
        }

        return metadata;
    }

    static register<T>(moduleOptions: DistributedLockConfig<T> | DistributedLockConfig<T>[]): DynamicModule {
        const locksToCreate = Array.isArray(moduleOptions) ? moduleOptions : [moduleOptions];

        const providers: Provider[] = [];
        const exports: ModuleMetadata['exports'] = [];

        for (const { name = 'root', ...config } of locksToCreate) {
            const configToken = DISTRIBUTED_LOCK_CONFIG(name);

            providers.push({
                provide: configToken,
                useValue: config,
            });
            exports.push(configToken);

            const createdLock = DistributedLockConfigModule.createLock({
                name,
                configToken,
            });

            providers.push(...(createdLock.providers ?? []));
            exports.push(...(createdLock.exports ?? []));
        }

        return {
            global: true,
            module: DistributedLockConfigModule,
            providers,
            exports,
        };
    }

    static inherit<T>(
        inheritConfigs: InheritDistributedLockConfig<T> | InheritDistributedLockConfig<T>[],
    ): DynamicModule {
        const locksToCreate = Array.isArray(inheritConfigs) ? inheritConfigs : [inheritConfigs];

        const providers: Provider[] = [];
        const exports: ModuleMetadata['exports'] = [];

        for (const { inheritFrom = 'root', config = {}, name } of locksToCreate) {
            const configToken = DISTRIBUTED_LOCK_CONFIG(name);

            const createdLock = DistributedLockConfigModule.createLock({
                name,
                configToken,
            });

            createdLock.providers.push({
                provide: configToken,
                useFactory: (inheritedConfig: DistributedLockConfig<T> | undefined) => {
                    if (inheritedConfig == null) {
                        if (inheritFrom === 'root') {
                            throw new Error(
                                `Looks like your named lock ${name} is trying to inherit from an unnamed lock configured in root but there is no unnamed root lock. Did you call .register with only named locks instead? If so pass in \`inheritFrom: <your lock name>\` to this .inherit call.`,
                            );
                        } else {
                            throw new Error(
                                `Looks like your named lock ${name} is trying to inherit from a lock named ${inheritFrom}, but ${inheritFrom} does not exist.`,
                            );
                        }
                    }

                    return {
                        ...inheritedConfig,
                        ...config,
                    };
                },
                inject: [{ token: DISTRIBUTED_LOCK_CONFIG(inheritFrom), optional: true }],
            });

            providers.push(...createdLock.providers);
            exports.push(...createdLock.exports);
        }

        return {
            module: DistributedLockConfigModule,
            providers,
            exports,
        };
    }

    static registerAsync<T>(asyncModuleOptions: AsyncModuleOptions<T> | AsyncModuleOptions<T>[]): DynamicModule {
        const locksToCreate = Array.isArray(asyncModuleOptions) ? asyncModuleOptions : [asyncModuleOptions];

        const providers: Provider[] = [];
        const exports: ModuleMetadata['exports'] = [];
        const imports: ModuleMetadata['imports'] = [];

        for (const { name = 'root', inject = [], useFactory, imports: depImports = [] } of locksToCreate) {
            const configToken = DISTRIBUTED_LOCK_CONFIG(name);

            providers.push({
                provide: configToken,
                inject,
                useFactory,
            });
            exports.push(configToken);

            imports.push(...depImports);

            const createdLock = DistributedLockConfigModule.createLock({
                name,
                configToken,
            });

            providers.push(...(createdLock.providers ?? []));
            exports.push(...(createdLock.exports ?? []));
        }

        return {
            global: true,
            module: DistributedLockConfigModule,
            providers,
            exports,
            imports,
        };
    }
}

interface AsyncModuleOptions<T>
    extends Pick<FactoryProvider<T>, 'useFactory' | 'inject'>,
        Pick<ModuleMetadata, 'imports'> {
    name?: string;
}

@Module({})
export class DistributedLockModule {
    static register<T>(moduleOptions: DistributedLockConfig<T> | DistributedLockConfig<T>[]): DynamicModule {
        return DistributedLockConfigModule.register(moduleOptions);
    }

    static registerAsync<T>(options: AsyncModuleOptions<T> | AsyncModuleOptions<T>[]): DynamicModule {
        return DistributedLockConfigModule.registerAsync(options);
    }

    static inherit<T>(
        registerOptions: InheritDistributedLockConfig<T> | InheritDistributedLockConfig<T>[],
    ): DynamicModule {
        return DistributedLockConfigModule.inherit(registerOptions);
    }
}
