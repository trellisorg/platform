/** Original source: {@link https://github.com/AmrSaber/simple-redis-mutex/blob/master/src/index.js} */

import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import promiseRetry from 'promise-retry';
import { DistributedLock } from '../distributed-lock';
import type { RetryOptions, UnlockFn } from '../lock-options';
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

    async tryLock(lockName: string): Promise<void> {
        const { lockKey } = this.#lockIds(lockName);

        const response = await this.#client.eval(checkLockScript, 1, lockKey);

        if (response === 'AVAILABLE') {
            return;
        }

        throw new Error(`${lockName} is currently acquired by another process.`);
    }

    async unlock(lockName: string, lockValue: string): Promise<void> {
        const { lockKey, lastOutIdKey } = this.#lockIds(lockName);

        await this.#client.eval(this.#releaseScript, 2, lockKey, lastOutIdKey, lockValue);
    }

    async lock(
        lockName: string,
        { retryOptions = {}, lockTimeout }: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number } = {},
    ): Promise<RedisMutexLockReturnValue> {
        const { nextIdKey, lockKey, lastOutIdKey } = this.#lockIds(lockName);

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

    /** Format the IDs based on the configured prefix and the name of the lock. */
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
