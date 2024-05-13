import type { DistributedLock } from '@trellisorg/distributed-lock';

export const DISTRIBUTED_LOCK_CONFIG = (name: string) => `@trellisorg/distributed-lock:config:${name}`;

export interface DistributedLockConfig<T> {
    adapter: (config: T) => DistributedLock;
    config: T;
    name?: string;
}

export interface InheritDistributedLockConfig<T> {
    /** The name of the lock to inherit from, if this is left out then the lock will inherit from the root lock. */
    inheritFrom?: string;
    /** When inheriting a lock the resulting lock must be named in DI. */
    name: string;
    /** The config to merge over top of the config that is being inherited from. */
    config?: Partial<T>;
}
