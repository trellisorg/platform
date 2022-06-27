import { StaticPool } from 'node-worker-threads-pool';
import { StaticPoolOptions } from 'node-worker-threads-pool/dist/staticPool';

export interface Message<T = any> {
    event: string;
    data: T;
}

export type Pools = Map<string, StaticPool<any>>;

export interface NestWorkerThreadConfig {
    pools: { id: string; options: StaticPoolOptions<any> }[];
}
