export function getLockToken(name: string): string {
    return `@trellisorg/distributed-lock:${name}DistributedLock:token`;
}
