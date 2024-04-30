import { Client, type QueryResult } from 'pg';
import promiseRetry from 'promise-retry';
import sql from 'sql-template-tag';
import type {
    AdvisoryLockFunction,
    AdvisoryLockOptions,
    LockedFunction,
    RetryOptions,
    UnlockFn,
} from './advisory-lock-options';
import { toAdvisoryLockHash } from './to-advisory-lock-hash';

/**
 * Will create a mutex that can be used to lock on a specific resource string in the PG Advisory Lock system.
 *
 * Original logic courtesy of {@link https://github.com/kolesnikovde/pg-advisory-locks/tree/master}
 */
export class AdvisoryLock {
    readonly #client: Client;

    constructor(private readonly options: AdvisoryLockOptions) {
        if (options.pg instanceof Client) {
            this.#client = options.pg;
        } else {
            this.#client = new Client(options.pg);
        }
    }

    /**
     * Runs an advisory lock operation against the DB using the {@link pg} driver. Will hash the lock name to a positive
     * 32bit integer and use a sql tagged template to format the query.
     */
    #runOperation({ lockName, lockFn }: { lockName: string; lockFn: AdvisoryLockFunction }): Promise<QueryResult> {
        const advisoryLockId = toAdvisoryLockHash(`${this.options.lockPrefix}${lockName}`);

        return this.#client.query(sql`SELECT ${lockFn} (${advisoryLockId});`);
    }

    #runOperationWithRetry({
        lockName,
        lockFn,
        retryOptions,
    }: {
        lockName: string;
        lockFn: AdvisoryLockFunction;
        retryOptions: RetryOptions;
    }) {
        return promiseRetry((retry) => this.#runOperation({ lockFn, lockName }).catch(retry), retryOptions);
    }

    async lock(lockName: string, retryOptions: Partial<RetryOptions> = {}): Promise<UnlockFn> {
        const lock = await this.#runOperationWithRetry({
            lockName,
            lockFn: 'pg_advisory_lock',
            retryOptions: {
                ...this.options.retryOptions,
                ...retryOptions,
            },
        });

        return () => this.unlock(lockName);
    }

    async unlock(lockName: string): Promise<void> {
        const unlocked = await this.#runOperation({
            lockName,
            lockFn: 'pg_advisory_unlock',
        });
    }

    async withLock<ReturnType>(
        lockName: string,
        lockedFunction: LockedFunction<ReturnType>,
        retryOptions: Partial<RetryOptions> = {},
    ): Promise<ReturnType> {
        const unlockFn = await this.lock(lockName, retryOptions);

        return lockedFunction().finally(() => unlockFn());
    }

    async tryLock(lockName: string): Promise<void> {
        await this.#runOperation({ lockName, lockFn: 'pg_try_advisory_lock' });
    }

    /**
     * Creates a child Mutex that can inherit options and build onto the lock prefix. Child locks will always use the
     * postgres connection from the parent.
     */
    implement(options: Omit<AdvisoryLockOptions, 'pg'>): AdvisoryLock {
        return new AdvisoryLock({
            ...options,
            pg: this.#client,
            lockPrefix: [this.options.lockPrefix, options.lockPrefix].filter(Boolean).join(),
        });
    }
}
