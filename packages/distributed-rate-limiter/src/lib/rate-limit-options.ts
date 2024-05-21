import type Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import type promiseRetry from 'promise-retry';

export type RetryOptions = Parameters<typeof promiseRetry>[0];
export type ShouldRetry = (error: unknown) => boolean | Promise<boolean>;
export type WithLimitFn<T> = () => Promise<T>;

export interface DistributedRateLimiterOptions {
    /**
     * The connection options for Redis, these will be passed into `ioredis` if a string or redis options or will
     * just use the Redis instance otherwise.
     *
     * Defaults to: `localhost:6379`
     */
    client: RedisOptions | Redis;

    /**
     * Configuration for retrying, how long, how many times, backoff, etc.
     *
     * These options are directly from promiseRetry and will be passed directly into it.
     */
    retryOptions: RetryOptions;

    /**
     * A rate limiter prefix that will be used to save the rate limit information "under" (will be used as the
     * Redis key prefix.
     *
     * Defaults to: `@trellisorg/distributed-rate-limiter`
     */
    rateLimiterPrefix: string;

    /**
     * The window size for the rate limiter, this will determine the amount of operations per this window. For
     * example, if this is set to 1000 (ms) and {@link maximum} is 10 then there can be 10 operations per second.
     *
     * Defaults to: 1000ms.
     */
    window: number;

    /**
     * The maximum number of operations per the {@link window}
     *
     * Defaults to: 10.
     */
    maximum: number;

    /**
     * A series of functions that will be run on errors thrown by the limited function when using the `withLimit`
     * function of the `DistributedRateLimiter` class.
     *
     * If any of these functions return true, the function will be run again after awaiting rate limit.
     */
    retryFunctions: ShouldRetry[];
}

export const defaultRateLimiterOptions: DistributedRateLimiterOptions = {
    client: {
        host: 'localhost',
        port: 6379,
    },
    retryOptions: {},
    rateLimiterPrefix: '@trellisorg/distributed-rate-limiter',
    window: 1_000,
    maximum: 10,
    retryFunctions: [],
};
