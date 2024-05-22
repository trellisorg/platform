import { Inject } from '@nestjs/common';
import { getRateLimiterToken } from './get-rate-limiter-token';

/**
 * Decorator to pull a named rate limiter from DI.
 *
 * @param name - The name of the rate limiter, this is optional and will set to `root` if not provided.
 */
export const InjectRateLimiter = (name?: string) => Inject(getRateLimiterToken(name || 'root'));
