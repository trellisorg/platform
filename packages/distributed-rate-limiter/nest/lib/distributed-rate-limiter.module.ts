import {
    Global,
    Module,
    type DynamicModule,
    type FactoryProvider,
    type ModuleMetadata,
    type Provider,
} from '@nestjs/common';
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';
import {
    RATE_LIMITER_CONFIG,
    type RateLimiterConfig,
    type RateLimiterFeatureConfig,
} from './distributed-rate-limiter.config';
import { getRateLimiterToken } from './get-rate-limiter-token';

type RateLimiterModuleConfig = Omit<RateLimiterConfig, 'config'> & {
    config: Partial<RateLimiterConfig['config']>;
};
type RateLimiterFeatureModuleConfig = Omit<RateLimiterFeatureConfig, 'config'> & {
    config: Partial<RateLimiterFeatureConfig['config']>;
};

@Global()
@Module({})
export class RateLimiterConfigModule {
    private static createRateLimiter({
        configToken,
        name,
    }: {
        configToken: string;
        name: string;
    }): Required<Pick<ModuleMetadata, 'exports' | 'providers'>> {
        const providerToken = getRateLimiterToken(name);

        const metadata: Required<Pick<ModuleMetadata, 'exports' | 'providers'>> = {
            providers: [
                {
                    provide: providerToken,
                    useFactory: (configFromDi: RateLimiterConfig) =>
                        new DistributedRateLimiter(configFromDi.config),
                    inject: [configToken],
                },
            ],
            exports: [providerToken],
        };

        if (name === 'root') {
            metadata.providers?.push({
                provide: DistributedRateLimiter,
                useExisting: providerToken,
            });
            metadata.exports?.push(DistributedRateLimiter);
        }

        return metadata;
    }

    static forRoot(moduleOptions: RateLimiterModuleConfig | RateLimiterModuleConfig[]): DynamicModule {
        return {
            global: true,
            module: RateLimiterConfigModule,
            ...RateLimiterConfigModule.options(moduleOptions),
        };
    }

    static forRootAsync(
        asyncModuleOptions:
            | AsyncModuleOptions<RateLimiterModuleConfig>
            | AsyncModuleOptions<RateLimiterModuleConfig>[]
    ): DynamicModule {
        return {
            global: true,
            module: RateLimiterConfigModule,
            ...RateLimiterConfigModule.asyncOptions(asyncModuleOptions),
        };
    }

    /**
     * Create the synchronous providers and exports for the module when DI is not needed to know the configuration
     * options.
     */
    static options(
        moduleOptions: RateLimiterModuleConfig | RateLimiterModuleConfig[]
    ): Required<Pick<ModuleMetadata, 'providers' | 'exports'>> {
        const rateLimitersToCreate = Array.isArray(moduleOptions) ? moduleOptions : [moduleOptions];

        const providers: Provider[] = [];
        const exports: ModuleMetadata['exports'] = [];

        for (const { name = 'root', ...config } of rateLimitersToCreate) {
            const configToken = RATE_LIMITER_CONFIG(name);

            providers.push({
                provide: configToken,
                useValue: config,
            });
            exports.push(configToken);

            const createdLock = RateLimiterConfigModule.createRateLimiter({
                name,
                configToken,
            });

            providers.push(...(createdLock.providers ?? []));
            exports.push(...(createdLock.exports ?? []));
        }

        return {
            providers,
            exports,
        };
    }

    /**
     * Configured async providers using the useFactory method in a reusable way so both forRoot and forFeature can
     * leverage the shared logic for creating rate limiters asynchronously (like pulling from ConfigService or
     * other DI tokens)
     */
    static asyncOptions(
        asyncModuleOptions:
            | AsyncModuleOptions<RateLimiterModuleConfig>
            | AsyncModuleOptions<RateLimiterModuleConfig>[]
    ): Required<Pick<ModuleMetadata, 'providers' | 'exports' | 'imports'>> {
        const locksToCreate = Array.isArray(asyncModuleOptions) ? asyncModuleOptions : [asyncModuleOptions];

        const providers: Provider[] = [];
        const exports: ModuleMetadata['exports'] = [];
        const imports: ModuleMetadata['imports'] = [];

        for (const { name = 'root', inject = [], useFactory, imports: depImports = [] } of locksToCreate) {
            const configToken = RATE_LIMITER_CONFIG(name);

            providers.push({
                provide: configToken,
                inject,
                useFactory,
            });
            exports.push(configToken);

            imports.push(...depImports);

            const createdLock = RateLimiterConfigModule.createRateLimiter({
                name,
                configToken,
            });

            providers.push(...(createdLock.providers ?? []));
            exports.push(...(createdLock.exports ?? []));
        }

        return {
            providers,
            exports,
            imports,
        };
    }

    /**
     * Shared logic for configuration the feature rate limiters.
     */
    static forFeature({ name, inheritFrom = 'root', config }: RateLimiterFeatureModuleConfig): DynamicModule {
        const featureConfigToken = RATE_LIMITER_CONFIG(name);

        const { providers, exports } = RateLimiterConfigModule.createRateLimiter({
            configToken: featureConfigToken,
            name,
        });

        return {
            module: RateLimiterConfigModule,
            providers: [
                {
                    provide: featureConfigToken,
                    useFactory: (inheritedConfig: RateLimiterModuleConfig): RateLimiterModuleConfig => ({
                        name,
                        config: {
                            ...inheritedConfig.config,
                            ...config,
                        },
                    }),
                    inject: [RATE_LIMITER_CONFIG(inheritFrom)],
                },
                ...providers,
            ],
            exports: [...exports],
        };
    }
}

interface AsyncModuleOptions<T>
    extends Pick<FactoryProvider<T>, 'useFactory' | 'inject'>,
        Pick<ModuleMetadata, 'imports'> {
    name?: string;
}

@Module({})
export class DistributedRateLimiterModule {
    /**
     * Register one or more root rate limiters, these will be available globally and can be inherited from when
     * doing forFeature to reuse the Redis configurations/instances but set some new capacity values (or vice
     * versa)
     */
    static forRoot(moduleOptions: RateLimiterModuleConfig | RateLimiterModuleConfig[]): DynamicModule {
        return RateLimiterConfigModule.forRoot(moduleOptions);
    }

    static forRootAsync(
        options: AsyncModuleOptions<RateLimiterModuleConfig> | AsyncModuleOptions<RateLimiterModuleConfig>[]
    ): DynamicModule {
        return RateLimiterConfigModule.forRootAsync(options);
    }

    /**
     * Register a feature rate limiter that inherits configurations from one of the root rate limiter configs. This
     * feature can be configured with a subset of the rate limiter configurations and what is supplied overwrite
     * what is configured on the rate limiter being inherited from, this does not change the inherited rate
     * limiter, it just uses the same configuration values.
     */
    static forFeature(config: RateLimiterFeatureModuleConfig): DynamicModule {
        return RateLimiterConfigModule.forFeature(config);
    }
}
