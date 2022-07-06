import { DynamicModule, Module, Provider } from '@nestjs/common';
import { StaticPool } from 'node-worker-threads-pool';
import { StaticWorkerPoolService } from './static-worker-pool.service';
import {
    getPoolServiceToken,
    getPoolToken,
    MAIN_THREAD_CONFIG,
} from './tokens';
import type { MainThreadConfig, NestWorkerThreadConfig } from './types';

const ONE_MINUTE = 1_000 * 60;

const defaultMainThreadConfig: MainThreadConfig = {
    timeout: ONE_MINUTE,
};

/**
 * @description Configuration module to provide the different static pools
 */
@Module({})
export class NestWorkerThreadModule {
    static forRoot(config: NestWorkerThreadConfig): DynamicModule {
        const providers: (Provider | Provider[])[] = [
            ...config.pools.map((poolConfig) => [
                /*
                Provide the plain pool token to be able to inject the StaticPool object
                 */
                {
                    provide: getPoolToken(poolConfig.id),
                    useValue: new StaticPool(poolConfig.options),
                },
                /*
                Provide the wrapper service that will support timing out and other
                configurations
                 */
                {
                    provide: getPoolServiceToken(poolConfig.id),
                    useFactory: (
                        mainThreadConfig: MainThreadConfig,
                        staticPool: StaticPool<any>
                    ) => {
                        return new StaticWorkerPoolService(
                            staticPool,
                            mainThreadConfig
                        );
                    },
                    inject: [MAIN_THREAD_CONFIG, getPoolToken(poolConfig.id)],
                },
            ]),
            {
                provide: MAIN_THREAD_CONFIG,
                useValue: {
                    ...defaultMainThreadConfig,
                    ...(config?.config ?? {}),
                },
            },
        ];

        return {
            module: NestWorkerThreadModule,
            providers: providers.flat(),
            exports: providers.flat(),
            global: true,
        };
    }
}
