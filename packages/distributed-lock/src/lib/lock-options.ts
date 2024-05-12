import type promiseRetry from 'promise-retry';

export type UnlockFn = () => Promise<void>;
export type RetryOptions = Parameters<typeof promiseRetry>[0];
export type LockedFunction<ReturnType> = (...args: unknown[]) => Promise<ReturnType>;

export interface LockOptions {
    /**
     * Configuration for retrying, how long, how many times, backoff, etc.
     *
     * These options are directly from promiseRetry and will be passed directly into it. They will be merged top down
     * when implementing a parent mutex.
     */
    retryOptions: RetryOptions;

    /**
     * An optional lock prefix that will be included as a prefix to the key used to acquire locks on. If no prefix is
     * define then `@trellisorg/distributed-lock` will be used.
     */
    lockPrefix: string;

    /** The time it takes for a lock to expire once it has been acquired. */
    lockTimeout: number;
}
