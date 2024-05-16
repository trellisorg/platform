import { shuffle } from 'lodash';
import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { LockError } from './lock-error';
import { RedisMutex } from './redis-mutex';

describe('RedisMutex', () => {
    let mutex: RedisMutex;

    describe('FIFO', () => {
        beforeAll(() => {
            mutex = new RedisMutex({
                client: {
                    host: 'localhost',
                    port: 6379,
                },
                fifo: true,
                lockPrefix: 'vitest',
                retryOptions: {},
                lockTimeout: 10_000,
            });
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

            await expect(mutex.checkLock(lock)).rejects.toThrowError();

            await unlock();

            await mutex.checkLock(lock);
        });

        it('should correctly return the lock is currently taken', async () => {
            const lock = randomUUID();

            const { unlock } = await mutex.lock(lock);

            await expect(mutex.checkLock(lock)).rejects.toThrowError();

            await unlock();
        });

        it('should correctly return the lock is currently not taken', async () => {
            const lock = randomUUID();

            await mutex.checkLock(lock);
        });
    });

    describe('First Come First Serve', () => {
        beforeAll(() => {
            mutex = new RedisMutex({
                client: {
                    host: 'localhost',
                    port: 6379,
                },
                fifo: false,
                lockPrefix: 'vitest',
                retryOptions: {},
                lockTimeout: 10_000,
            });
        });

        it('should unlock correctly using returned unlock function', async () => {
            const lock = randomUUID();

            const { unlock } = await mutex.lock(lock);

            await expect(mutex.checkLock(lock)).rejects.toThrowError();

            await unlock();

            await mutex.checkLock(lock);
        });

        it('should return partial lock error', async () => {
            const resource1 = randomUUID();
            const resource2 = randomUUID();
            const resource3 = randomUUID();

            const { unlock } = await mutex.lock([resource1, resource2]);

            await expect(mutex.checkLock([resource1, resource3])).rejects.toThrowError(
                new LockError({
                    name: 'PARTIAL_LOCK',
                    message: `One of ${[resource1, resource3].join(',')} is currently acquired by another process.`,
                })
            );

            await unlock();
        });

        it('should correctly return the lock is currently taken', async () => {
            const lock = randomUUID();

            const { unlock } = await mutex.lock(lock);

            await expect(mutex.checkLock(lock)).rejects.toThrowError();

            await unlock();
        });

        it('should correctly return the lock is currently not taken', async () => {
            const lock = randomUUID();

            await mutex.checkLock(lock);
        });
    });
});
