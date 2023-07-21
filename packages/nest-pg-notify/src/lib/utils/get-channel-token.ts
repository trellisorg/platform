export function getChannelToken(name: string): string {
    return `PgChannel_${name}`;
}

export function getChannelOptionsToken(name: string): string {
    return `PgChannel_${name}_options`;
}
