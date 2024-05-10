import type { Client, ClientConfig } from 'pg';
import type { LockOptions } from '../lock-options';

export type AdvisoryLockFunction = 'pg_advisory_lock' | 'pg_advisory_unlock' | 'pg_try_advisory_lock';

export interface AdvisoryLockOptions extends LockOptions {
    /**
     * The Postgres connection parameters to use to connection to the database. Will only be connected once within a
     * single Mutex
     */
    pg: string | ClientConfig | Client;
}
