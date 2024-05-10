import type { LockOptions, LockedFunction, RetryOptions, UnlockFn } from './lock-options';

export abstract class DistributedLock {
    protected readonly prefix: string;

    protected constructor(protected readonly options: LockOptions) {
        this.prefix = `${this.options.lockPrefix.trim()}:lock`;
    }

    abstract lock(
        lockName: string,
        { retryOptions = {}, lockTimeout }: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number },
    ): Promise<{ unlock: UnlockFn; lockValue?: string }>;

    abstract unlock(lockName: string, lockValue?: string): Promise<void>;

    abstract tryLock(lockName: string): Promise<void>;

    async withLock<ReturnType>(
        lockName: string,
        lockedFunction: LockedFunction<ReturnType>,
        options: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number },
    ): Promise<ReturnType> {
        const { unlock } = await this.lock(lockName, options);

        return lockedFunction().finally(() => unlock());
    }
}
