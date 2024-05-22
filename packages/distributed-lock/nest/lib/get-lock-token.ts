/**
 * Constructs the DI token for a named lock.
 *
 * @param name - The name of the lock to be combined with a string unique to this package.
 */
export function getLockToken(name: string): string {
    return `@trellisorg/distributed-lock:${name}DistributedLock:token`;
}
