import type { DistributedLock } from '@trellisorg/distributed-lock';

export const DISTRIBUTED_LOCK_CONFIG = (name?: string) =>
    Symbol(`@trellisorg/distributed-lock:config${name ? `:${name}` : ''}`);

export interface DistributedLockConfig<T> {
    adapter: (config: T) => DistributedLock;
    config: T;
}
