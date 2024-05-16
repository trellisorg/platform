import type { LockOptions, LockedFunction, RetryOptions, UnlockFn } from './lock-options';

/**
 * The base class defining the functionality for a lock. Both Redis and Advisory locks will use this class so the
 * underlying implementation can be swapped out without any impact to the user.
 */
export abstract class DistributedLock {
    protected readonly prefix: string;

    protected constructor(protected readonly options: LockOptions) {
        this.prefix = `${this.options.lockPrefix.trim()}:lock`;
    }

    abstract lock(
        lockName: string,
        { retryOptions = {}, lockTimeout }: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number }
    ): Promise<{ unlock: UnlockFn; lockValue?: string }>;

    abstract checkLock(lockName: string | string[]): Promise<void>;

    async withLock<ReturnType>(
        lockName: string,
        lockedFunction: LockedFunction<ReturnType>,
        options: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number } = {}
    ): Promise<ReturnType> {
        const { unlock } = await this.lock(lockName, options);

        return lockedFunction().finally(() => unlock());
    }
}
