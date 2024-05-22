import type promiseRetry from 'promise-retry';

export type RetryOptions = Parameters<typeof promiseRetry>[0];
export type LockedFunction<ReturnType> = (...args: unknown[]) => Promise<ReturnType>;

export interface LockOptions {
    /**
     * Configuration for retrying, how long, how many times, backoff, etc.
     *
     * These options are directly from promiseRetry and will be passed directly into it. They will be merged top
     * down when implementing a parent mutex.
     */
    retryOptions: RetryOptions;

    /**
     * An optional lock prefix that will be included as a prefix to the key used to acquire locks on. If no prefix
     * is defined then `@trellisorg/distributed-lock` will be used.
     */
    lockPrefix: string;

    /**
     * The time it takes for a lock to expire once it has been acquired. Defaults to 10,000ms.
     */
    lockTimeout: number;

    /**
     * The threshold before a lock will be automatically extended, this should be large enough that the lock does
     * not expire while it is being attempted to be extended. Defaults to 500ms.
     */
    automaticExtensionThreshold: number;
}

export type UnlockFn = () => Promise<void>;
export type ExtendFn = () => Promise<LockReturnValue>;

export interface LockReturnValue {
    /**
     * The function that will release the lock allowing the next process to acquire it.
     */
    unlock: UnlockFn;

    /**
     * Will attempt to extend the lock by the original timeout time configured in the {@link LockOptions}. Will
     * throw an error if the lock is unable to be extended. This can happen if one of the resources this lock had
     * acquired a lock on has been acquired by a different lock. In the case of one of the locks expires before
     * extension happens but is not picked up by another lock then this lock will be able to re-acquire that
     * resource lock.
     */
    extend: ExtendFn;

    /**
     * The Date in milliseconds since epoch that the lock will expire.
     */
    expiration: number;
}

export type WithLockOptions = Partial<
    Pick<LockOptions, 'retryOptions' | 'lockTimeout' | 'automaticExtensionThreshold'>
>;
