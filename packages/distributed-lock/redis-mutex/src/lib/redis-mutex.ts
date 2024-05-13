/** Original source: {@link https://github.com/AmrSaber/simple-redis-mutex/blob/master/src/index.js} */

import { DistributedLock, type RetryOptions, type UnlockFn } from '@trellisorg/distributed-lock';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import promiseRetry from 'promise-retry';
import { acquireScript, acquireWithFifoScript, checkLockScript, releaseScript, releaseWithFifoScript } from './lua';
import type { RedisMutexLockOptions } from './redis-mutex-lock-options';

interface RedisMutexLockReturnValue {
    unlock: UnlockFn;
    lockValue: string;
}

export class RedisMutex extends DistributedLock {
    readonly #client: Redis;
    readonly #acquireScript: string;
    readonly #releaseScript: string;

    constructor(protected override readonly options: RedisMutexLockOptions) {
        super(options);

        if (options.client instanceof Redis) {
            this.#client = options.client;
        } else {
            this.#client = new Redis(options.client);
        }

        this.#acquireScript = options.fifo ? acquireWithFifoScript : acquireScript;
        this.#releaseScript = options.fifo ? releaseWithFifoScript : releaseScript;
    }

    /**
     * Checks to see if the lock would be able to be acquired without actually acquiring it. Will reject if the lock is
     * taken.
     *
     * @param lockSuffix - The suffix added to the lock name + prefix to ensure uniqueness across lock acquisitions.
     */
    async tryLock(lockSuffix: string): Promise<void> {
        const { lockKey } = this.#lockIds(lockSuffix);

        const response = await this.#client.eval(checkLockScript, 1, lockKey);

        if (response === 'AVAILABLE') {
            return;
        }

        throw new Error(`${lockSuffix} is currently acquired by another process.`);
    }

    /**
     * Unlocks the lock manually, if using {@link lock} then this function must be called after you are finished with the
     * lock and do not need it anymore. Alternatively, the {@link lock} function will return an unlock function that can
     * be called.
     *
     * @param lockSuffix - The suffix added to the lock name + prefix to ensure uniqueness across lock acquisitions.
     * @param lockValue - The value of the lock, this serves no functional purpose in the lock other than provide a way
     *   to check an instance of a lock is the right one in the lua scripts.
     */
    async unlock(lockSuffix: string, lockValue: string): Promise<void> {
        const { lockKey, lastOutIdKey } = this.#lockIds(lockSuffix);

        await this.#client.eval(this.#releaseScript, 2, lockKey, lastOutIdKey, lockValue);
    }

    /**
     * Acquire a lock synchronously, this will return an unlock function that must be called after work has been
     * completed.
     *
     * @param lockSuffix - The suffix added to the lock name + prefix to ensure uniqueness across lock acquisitions.
     * @param retryOptions - The options to pass along to {@link promiseRetry} to determine backoff and retries. This is
     *   optional and will be merged over top of the retry options configured at the lock level.
     * @param lockTimeout - The time it will take the lock to time out and throw an error. Optional and will override
     *   whatever was configured at the lock level.
     */
    async lock(
        lockSuffix: string,
        { retryOptions = {}, lockTimeout }: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number } = {},
    ): Promise<RedisMutexLockReturnValue> {
        const { nextIdKey, lockKey, lastOutIdKey } = this.#lockIds(lockSuffix);

        const lockValue = randomUUID();

        let id: number;

        if (this.options.fifo) {
            id = await this.#client.incr(nextIdKey);
        }

        const timeoutMillis = lockTimeout ?? this.options.lockTimeout;

        /*
        Acquire the lock using the retry options defined at the instance and call level merged together.
         */
        await promiseRetry(
            async (retry) => {
                try {
                    const response = await this.#client.eval(
                        this.#acquireScript,
                        2,
                        lockKey,
                        lastOutIdKey,
                        lockValue,
                        timeoutMillis,
                        id,
                    );

                    if (response === 'OK') {
                        return;
                    } else {
                        retry(new Error(`Unable to acquire lock: ${lockKey}`));
                    }
                } catch (e) {
                    retry(e);
                }
            },
            {
                ...this.options.retryOptions,
                ...retryOptions,
            },
        );

        return {
            unlock: async () => {
                await this.#client.eval(this.#releaseScript, 2, lockKey, lastOutIdKey, lockValue);
            },
            lockValue,
        };
    }

    /**
     * Format the IDs based on the configured prefix and the suffix of the lock to ensure they are all formatted the
     * same throughout this class. These values can be anything as long as they are unique across different locks within
     * an application.
     */
    #lockIds(lockName: string) {
        const lockKey = `${this.prefix}-${lockName}`;
        const nextIdKey = `${this.prefix}-${lockName}:next-id`;
        const lastOutIdKey = `${this.prefix}-${lockName}:last-out-id`;

        return {
            lockKey,
            nextIdKey,
            lastOutIdKey,
        };
    }
}
