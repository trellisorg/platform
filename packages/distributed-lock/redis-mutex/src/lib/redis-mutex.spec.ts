import { shuffle } from 'lodash';
import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
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

    it('should process locks in fifo order', async () => {
        const lock = randomUUID();
        const fn = vi.fn();

        async function myFunction(param: number) {
            fn(param);
        }

        const { unlock } = await mutex.lock(lock);

        await myFunction(-1);

        const locks = new Array(1000)
            .fill(0)
            .map((_, index) => index)
            .map((num) => myFunction(num));

        await unlock();

        await Promise.all(shuffle(locks));

        expect(fn).toHaveBeenNthCalledWith(1, -1);

        for (let x = 0; x < 100; x++) {
            expect(fn).toHaveBeenNthCalledWith(2 + x, x);
        }
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
