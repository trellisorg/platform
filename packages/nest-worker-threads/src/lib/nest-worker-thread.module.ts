import { DynamicModule, Module } from '@nestjs/common';
import { StaticPool } from 'node-worker-threads-pool';
import { getPoolToken } from './tokens';
import { NestWorkerThreadConfig } from './types';

/**
 * @description Configuration module to provide the different static pools
 */
@Module({})
export class NestWorkerThreadModule {
    static forRoot(config: NestWorkerThreadConfig): DynamicModule {
        const providers = config.pools.map((poolConfig) => ({
            provide: getPoolToken(poolConfig.id),
            useValue: new StaticPool(poolConfig.options),
        }));

        return {
            module: NestWorkerThreadModule,
            providers,
            exports: providers,
            global: true,
        };
    }
}
