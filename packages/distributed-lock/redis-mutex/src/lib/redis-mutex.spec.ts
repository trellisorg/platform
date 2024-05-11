import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { RedisMutex } from './redis-mutex';

describe('RedisMutex', () => {
    const mutex = new RedisMutex({
        client: {
            host: 'localhost',
            port: 6379,
        },
        fifo: true,
        lockPrefix: 'vitest',
        retryOptions: {},
        lockTimeout: 10_000,
    });

    it('should unlock correctly using returned unlock function', async () => {
        const lock = randomUUID();

        const { unlock } = await mutex.lock(lock);

        await expect(mutex.tryLock(lock)).rejects.toThrowError();

        await unlock();

        await mutex.tryLock(lock);
    });

    it('should unlock correctly using class unlock function', async () => {
        const lock = randomUUID();

        const { lockValue } = await mutex.lock(lock);

        await expect(mutex.tryLock(lock)).rejects.toThrowError();

        await mutex.unlock(lock, lockValue);

        await mutex.tryLock(lock);
    });

    it('should correctly return the lock is currently taken', async () => {
        const lock = randomUUID();

        const { unlock } = await mutex.lock(lock);

        await expect(mutex.tryLock(lock)).rejects.toThrowError();

        await unlock();
    });

    it('should correctly return the lock is currently not taken', async () => {
        const lock = randomUUID();

        await mutex.tryLock(lock);
    });
});
