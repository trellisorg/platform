import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { DistributedRateLimiter } from './distributed-rate-limiter';

describe('DistributedRateLimiter', () => {
    let rateLimiter: DistributedRateLimiter;

    beforeAll(() => {
        rateLimiter = new DistributedRateLimiter({
            rateLimiterPrefix: '@trellisorg/distributed-rate-limiter',
            retryOptions: {},
            client: {
                host: 'localhost',
                port: 6379,
            },
            window: 5_000,
            maximum: 100,
        });
    });

    it('should work when no calls have been made', async () => {
        await expect(rateLimiter.limit(randomUUID())).resolves.toEqual(undefined);
    });

    it('should timeout because the capacity does not refresh soon enough', async () => {
        const resource = randomUUID();

        // Fill up all capacity
        for (let i = 0; i < 100; i++) {
            await rateLimiter.limit(resource);
        }

        await expect(
            Promise.race([
                rateLimiter.limit(resource),
                new Promise((resolve, reject) => setTimeout(() => reject(), 2_000)),
            ])
        ).rejects.toEqual(undefined);
    });

    it('should refresh capacity and allow a new limited value', async () => {
        const resource = randomUUID();

        // Fill up all capacity
        for (let i = 0; i < 100; i++) {
            await rateLimiter.limit(resource);
        }

        await expect(
            Promise.race([
                rateLimiter.limit(resource),
                new Promise((resolve, reject) => setTimeout(() => reject(), 10_000)),
            ])
        ).resolves.toEqual(undefined);
    }, 20_000);
});
