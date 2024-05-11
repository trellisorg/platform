import { DistributedLock, type RetryOptions, type UnlockFn } from '@trellisorg/distributed-lock';
import { Client, type QueryResult } from 'pg';
import promiseRetry from 'promise-retry';
import sql from 'sql-template-tag';
import type { AdvisoryLockFunction, AdvisoryLockOptions } from './advisory-lock-options';
import { toAdvisoryLockHash } from './to-advisory-lock-hash';

/**
 * Will create a mutex that can be used to lock on a specific resource string in the PG Advisory Lock system.
 *
 * Original logic courtesy of {@link https://github.com/kolesnikovde/pg-advisory-locks/tree/master}
 */
export class AdvisoryLock extends DistributedLock {
    readonly #client: Client;

    protected constructor(protected override readonly options: AdvisoryLockOptions) {
        super(options);

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
        const advisoryLockId = toAdvisoryLockHash(`${this.prefix}${lockName}`);

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

    async lock(
        lockName: string,
        { retryOptions = {} }: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number },
    ): Promise<{ unlock: UnlockFn; lockValue?: string }> {
        await this.#runOperationWithRetry({
            lockName,
            lockFn: 'pg_advisory_lock',
            retryOptions: {
                ...this.options.retryOptions,
                ...retryOptions,
            },
        });

        return {
            unlock: () => this.unlock(lockName),
        };
    }

    async unlock(lockName: string): Promise<void> {
        await this.#runOperation({
            lockName,
            lockFn: 'pg_advisory_unlock',
        });
    }

    async tryLock(lockName: string): Promise<void> {
        await this.#runOperation({ lockName, lockFn: 'pg_try_advisory_lock' });
    }
}
