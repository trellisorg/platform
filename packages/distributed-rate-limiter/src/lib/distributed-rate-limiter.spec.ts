import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DistributedRateLimiter } from './distributed-rate-limiter';

describe('DistributedRateLimiter', () => {
    let rateLimiter: DistributedRateLimiter;

    beforeEach(() => {
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

    it('should rate limit using withLimit', async () => {
        await expect(rateLimiter.withLimit(randomUUID(), () => Promise.resolve(true))).resolves.toEqual(true);
    });

    it('should retry the function call once', async () => {
        vi.spyOn(rateLimiter, 'limit');

        let count = 0;

        const fn = () => {
            count++;

            if (count > 1) {
                return Promise.resolve(true);
            }

            throw new Error();
        };

        await expect(
            rateLimiter.withLimit(randomUUID(), fn, [(error) => error instanceof Error])
        ).resolves.toEqual(true);

        expect(rateLimiter.limit).toHaveBeenCalledTimes(2);
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
