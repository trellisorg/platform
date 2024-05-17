import type { LockOptions, LockReturnValue, LockedFunction } from './lock-options';

/**
 * The base class defining the functionality for a lock. Both Redis and Advisory locks will use this class so the
 * underlying implementation can be swapped out without any impact to the user.
 *
 * Inspiration taken from:
 *
 * 1. https://github.com/mike-marcacci/node-redlock.
 */
export abstract class DistributedLock {
    protected readonly options: LockOptions;

    protected readonly prefix: string;

    protected constructor(protected readonly _options: Partial<LockOptions>) {
        this.options = {
            automaticExtensionThreshold: _options.automaticExtensionThreshold ?? 500,
            lockPrefix: _options.lockPrefix ?? '@trellisorg/distributed-lock',
            lockTimeout: _options.lockTimeout ?? 10_000,
            retryOptions: _options.retryOptions ?? {},
        };

        this.prefix = `${this.options.lockPrefix}:lock`;
    }

    protected abstract _lock(resource: string | string[], options: LockOptions): Promise<LockReturnValue>;

    abstract lock(
        resources: string | string[],
        options: Partial<Pick<LockOptions, 'retryOptions' | 'lockTimeout'>>
    ): Promise<LockReturnValue>;

    abstract checkLock(lockName: string | string[]): Promise<void>;

    async withLock<ReturnType>(
        lockName: string,
        lockedFunction: LockedFunction<ReturnType>,
        options: Partial<Pick<LockOptions, 'retryOptions' | 'lockTimeout' | 'automaticExtensionThreshold'>> = {}
    ): Promise<ReturnType> {
        const lockOptions: LockOptions = {
            ...this.options,
            ...options,
        };

        let timeout: NodeJS.Timeout | null = null;
        let extension: Promise<LockReturnValue | null> = Promise.resolve(null);
        const abortController = new AbortController();

        // Clears and resets the extension timeout for this lock call.
        function clear(): void {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        }

        let lock = await this._lock(lockName, lockOptions);

        // Attempts to extend this lock from within the closure of this lock acquisition so that if extension is not possible an error can be thrown.
        async function attemptExtension(): Promise<LockReturnValue | null> {
            clear();

            try {
                lock = await lock.extend();
                registerExpiration(lock.expiration);

                return lock;
            } catch (e) {
                if (lock.expiration > Date.now()) {
                    return (extension = lock.extend());
                }

                abortController.abort(`Unable to extend lock.`);

                return null;
            }
        }

        // This lock instances in-memory timeout that will trigger an extension of the lock.
        function registerExpiration(expiration: number): void {
            timeout = setTimeout(
                () => (extension = attemptExtension()),
                expiration - Date.now() - lockOptions.automaticExtensionThreshold
            );
        }

        registerExpiration(lock.expiration);

        try {
            return await lockedFunction();
        } finally {
            clear();

            /*
            Wait for all in-flight lock extensions to finish before continuing just to safe.
            We catch any errors that happens and silently ignore them as they do not matter and know that it will be
            unlocked afterward anyway.
             */
            if (extension != null) {
                await extension.catch();
            }

            await lock.unlock();
        }
    }
}
