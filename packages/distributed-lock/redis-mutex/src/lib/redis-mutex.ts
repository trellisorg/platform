/**
 * Original source: {@link https://github.com/AmrSaber/simple-redis-mutex/blob/master/src/index.js}
 */

import { DistributedLock, type RetryOptions, type UnlockFn } from '@trellisorg/distributed-lock';
import Redis from 'ioredis';
import { createHash, randomUUID } from 'node:crypto';
import promiseRetry from 'promise-retry';
import { LockError } from './lock-error';
import {
    acquireScript,
    acquireWithFifoScript,
    checkLockScript,
    releaseScript,
    releaseWithFifoScript,
} from './lua';
import type { RedisMutexLockOptions } from './redis-mutex-lock-options';

interface RedisMutexLockReturnValue {
    unlock: UnlockFn;
}

interface LuaScript {
    /**
     * The source code of the script to run. This is a template string containing a Lua script.
     */
    source: string;
    /**
     * The Redis compatible sha1 hash of the script.
     */
    hash?: string;
}

/**
 * Distributed Locking: The RedisMutex class implements a distributed lock using Redis as the backing store. This
 * allows multiple processes or nodes to coordinate access to shared resources. FIFO Ordering: The lock can be
 * configured to follow FIFO (First-In, First-Out) order, ensuring that locks are acquired and released in the
 * order they were requested. Multi-Resource Locking: The lock method supports acquiring multiple locks
 * simultaneously. Lock Timeout: The lock has a timeout value, preventing deadlocks by automatically releasing the
 * lock after a specified duration. Retry Options: The lock method supports retry options to handle temporary lock
 * acquisition failures.
 *
 * Options: client: A Redis connection configuration or a Redis instance. fifo: Whether to use FIFO ordering for
 * lock acquisition (default: false). lockPrefix: A prefix for the lock keys (default:
 *
 * @trellisorg/distributed-lock). retryOptions: Options for retrying lock acquisition (see promise-retry
 * documentation). lockTimeout: The time it takes for a lock to expire after acquisition (default: 10 seconds).
 * Methods: tryLock(resource): Checks if the lock can be acquired without actually acquiring it. Rejects if the
 * lock is taken. lock(resource, options): Acquires a lock synchronously and returns an unlock function.
 * withLock(lockName, lockedFunction, options): Acquires a lock, executes a provided function, and releases the
 * lock.
 */
export class RedisMutex extends DistributedLock {
    readonly #client: Redis;
    readonly #acquireScript: LuaScript;
    readonly #releaseScript: LuaScript;
    readonly #checkLockScript: LuaScript;

    constructor(protected override readonly options: RedisMutexLockOptions) {
        super(options);

        if (options.client instanceof Redis) {
            this.#client = options.client;
        } else {
            this.#client = new Redis(options.client);
        }

        const acquire = options.fifo ? acquireWithFifoScript : acquireScript;
        const release = options.fifo ? releaseWithFifoScript : releaseScript;

        this.#acquireScript = {
            source: acquire,
        };

        this.#releaseScript = {
            source: release,
        };

        this.#checkLockScript = {
            source: checkLockScript,
        };
    }

    /**
     * Checks to see if the lock would be able to be acquired without actually acquiring it. Will reject if the
     * lock is taken.
     *
     * @param resources - The resource to lock on.
     */
    async checkLock(resources: string | string[]): Promise<void> {
        let _resources = [resources].flat();

        if (this.options.fifo) {
            _resources = [_resources.join('|')];
        }

        const lockKeys = _resources.map((resource) => this.#lockIds(resource).lockKey);

        const hash = await this.#getScriptHash(this.#checkLockScript);

        const response = await this.#client.evalsha(hash, lockKeys.length, lockKeys);

        if (response === 'AVAILABLE') {
            return;
        }

        throw new LockError({
            message: `One of ${_resources.join(',')} is currently acquired by another process.`,
            name: response as string,
        });
    }

    /**
     * Acquire a lock synchronously, this will return an unlock function that must be called after work has been
     * completed.
     *
     * @param resource - The resource to lock on, this can be one or more resources. If the lock is a FIFO queue
     *   then the resources will be joined by a pipe as multi-resource locking is not supported in FIFO locks.
     * @param retryOptions - The options to pass along to {@link promiseRetry} to determine backoff and retries.
     *   This is optional and will be merged over top of the retry options configured at the lock level.
     * @param lockTimeout - The time it will take the lock to time out and throw an error. Optional and will
     *   override whatever was configured at the lock level.
     */
    async lock(
        resource: string | string[],
        { retryOptions = {}, lockTimeout }: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number } = {}
    ): Promise<RedisMutexLockReturnValue> {
        const resources: string[] = [resource].flat();

        // An array of flattened tuples, first being the lockKey, the second being the lock value
        const keyArgs: string[] = [];

        let id = 0;
        let lastIdKey = '0';

        if (this.options.fifo) {
            const { nextIdKey, lockKey, lastOutIdKey } = this.#lockIds(resources.join('|'));

            lastIdKey = lastOutIdKey;

            id = await this.#client.incr(nextIdKey);

            const lockValue = randomUUID();

            keyArgs.push(lockKey, lockValue);
        } else {
            for (const resource of resources) {
                const { lockKey } = this.#lockIds(resource);

                const lockValue = randomUUID();

                keyArgs.push(lockKey, lockValue);
            }
        }

        const timeoutMillis = lockTimeout ?? this.options.lockTimeout;

        const hash = await this.#getScriptHash(this.#acquireScript);

        /*
        Acquire the lock using the retry options defined at the instance and call level merged together.
         */
        await promiseRetry(
            async (retry) => {
                try {
                    const response = await this.#client.evalsha(
                        hash,
                        keyArgs.length,
                        ...keyArgs,
                        lastIdKey,
                        timeoutMillis,
                        id
                    );

                    if (response === 'OK') {
                        return;
                    } else {
                        retry(new Error(`Unable to acquire lock`));
                    }
                } catch (e) {
                    retry(e);
                }
            },
            {
                ...this.options.retryOptions,
                ...retryOptions,
            }
        );

        const releaseHash = await this.#getScriptHash(this.#releaseScript);

        return {
            unlock: async () => {
                await this.#client.evalsha(releaseHash, keyArgs.length, ...keyArgs, lastIdKey);
            },
        };
    }

    /**
     * Format the IDs based on the configured prefix and the suffix of the lock to ensure they are all formatted
     * the same throughout this class. These values can be anything as long as they are unique across different
     * locks within an application.
     *
     * @param resource - The resource to lock on.
     */
    #lockIds(resource: string) {
        const lockKey = `${this.prefix}-${resource}`;
        const nextIdKey = `${this.prefix}-${resource}:next-id`;
        const lastOutIdKey = `${this.prefix}-${resource}:last-out-id`;

        return {
            lockKey,
            nextIdKey,
            lastOutIdKey,
        };
    }

    /**
     * Generate a sha1 hash compatible with redis evalsha.
     */
    #hash(value: string): string {
        return createHash('sha1').update(value).digest('hex');
    }

    async #getScriptHash(script: LuaScript): Promise<string> {
        if (script.hash == null) {
            script.hash = this.#hash(script.source);

            await this.#client.script('LOAD', script.source);
        }

        return script.hash;
    }
}
