/**
 * Constructs the DI token for a named rate limiter.
 *
 * @param name - The name of the rate limiter to be combined with a string unique to this package.
 */
export function getRateLimiterToken(name: string): string {
    return `@trellisorg/distributed-rate-limiter:${name}RateLimiter:token`;
}
