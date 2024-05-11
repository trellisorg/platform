export function getLockToken(name: string): string {
    return `${name}DistributedLock`;
}
