import type Redis from 'ioredis';
import type { LockOptions } from '../lock-options';

export interface RedisMutexLockOptions extends LockOptions {
    /**
     * The connection options for Redis, these will be passed into `ioredis` if a string or redis options or will just
     * use the Redis instance otherwise.
     */
    client: ConstructorParameters<typeof Redis> | Redis;

    /** Whether this lock should abide by FIFO order or just let whoever acquires the lock first win. */
    fifo: boolean;
}
