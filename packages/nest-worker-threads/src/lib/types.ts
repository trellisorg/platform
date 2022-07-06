import type { StaticPool } from 'node-worker-threads-pool';

export interface Message<T = any> {
    event: string;
    data: T;
}

export type Pools = Map<string, StaticPool<any>>;

export type StaticPoolOptions = ConstructorParameters<typeof StaticPool<any>>[0]

export interface MainThreadConfig {
    timeout: number;
}

export interface NestWorkerThreadConfig {
    pools: { id: string; options: StaticPoolOptions }[];
    config?: Partial<MainThreadConfig>
}
