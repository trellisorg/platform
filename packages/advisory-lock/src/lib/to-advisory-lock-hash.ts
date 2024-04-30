/**
 * Postgres Advisory locks are stored as positive 32bit integers but lock keys are typically used as strings to make it
 * more clear as to what is being locked.
 *
 * Original source: {@link https://github.com/darkskyapp/string-hash}
 */
export function toAdvisoryLockHash(lockKey: string): number {
    let hash = 5381;
    let i = lockKey.length;

    while (i) {
        hash = (hash * 33) ^ lockKey.charCodeAt(--i);
    }

    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
}
