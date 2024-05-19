import type { DistributedRateLimiterOptions } from '@trellisorg/distributed-rate-limiter';

export const RATE_LIMITER_CONFIG = (name: string) => `@trellisorg/distributed-rate-limiter:config:${name}`;

export interface RateLimiterConfig {
    /**
     * Rate limiter configuration options to define the capacity/time of the limiter and retry options.
     */
    config: DistributedRateLimiterOptions;

    /**
     * The name of the rate limiter, if this is left out `root` is used.
     */
    name?: string;
}

export interface RateLimiterFeatureConfig {
    /**
     * The partial configuration of the rate limiter this will be merged on top of the inherited rate limiter
     * config.
     */
    config: Partial<DistributedRateLimiterOptions>;

    /**
     * The name of the feature rate limiter.
     */
    name: string;

    /**
     * The name of the rate limiter to inherit from, if left out `root` will be used.
     */
    inheritFrom?: string;
}
