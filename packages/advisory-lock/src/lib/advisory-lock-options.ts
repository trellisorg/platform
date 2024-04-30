import type { Client, ClientConfig } from 'pg';
import type promiseRetry from 'promise-retry';

export type AdvisoryLockFunction = 'pg_advisory_lock' | 'pg_advisory_unlock' | 'pg_try_advisory_lock';
export type UnlockFn = () => Promise<void>;

export type RetryOptions = Parameters<typeof promiseRetry>[0];
export type LockedFunction<ReturnType> = (...args: unknown[]) => Promise<ReturnType>;

export interface AdvisoryLockOptions {
    /**
     * The Postgres connection parameters to use to connection to the database. Will only be connected once within a
     * single Mutex
     */
    pg: string | ClientConfig | Client;

    /**
     * Configuration for retrying, how long, how many times, backoff, etc.
     *
     * These options are directly from promiseRetry and will be passed directly into it. They will be merged top down
     * when implementing a parent mutex.
     */
    retryOptions: RetryOptions;

    /**
     * An optional lock prefix that will be included as a prefix to the key used to acquire locks on. When implementing
     * a lock to build a child lock the child lock will inherit this prefix and continue building on it.
     */
    lockPrefix?: string;
}
