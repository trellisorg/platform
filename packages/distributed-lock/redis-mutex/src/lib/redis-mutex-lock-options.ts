import type { LockOptions } from '@trellisorg/distributed-lock';
import type Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';

export interface RedisMutexLockOptions extends Partial<LockOptions> {
    /**
     * The connection options for Redis, these will be passed into `ioredis` if a string or redis options or will
     * just use the Redis instance otherwise.
     */
    client: RedisOptions | Redis;

    /**
     * Whether this lock should abide by FIFO order or just let whoever acquires the lock first win.
     */
    fifo: boolean;
}
