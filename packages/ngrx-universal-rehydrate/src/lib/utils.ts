export const enum MergeStrategy {
    OVERWRITE = 'overwrite',
    MERGE_OVER = 'mergeOver',
    MERGE_UNDER = 'mergeUnder',
}

export const defaultRehydrationRootConfig: RehydrationRootConfig = {
    stores: undefined,
    disableWarnings: false,
    mergeStrategy: MergeStrategy.MERGE_OVER,
};

export interface RehydrationRootConfig {
    stores: string[] | undefined;
    disableWarnings: boolean;
    mergeStrategy: MergeStrategy;
}

export function merge(over: any, under: any): any {
    return Object.entries(over).reduce(
        (prev, [key, value]) => ({
            ...prev,
            [key]: value,
        }),
        under
    );
}

export function mergeStates<T, K>(
    initial: T,
    transfer: K,
    mergeStrategy: MergeStrategy
): any {
    switch (mergeStrategy) {
        case MergeStrategy.OVERWRITE:
            return transfer;
        case MergeStrategy.MERGE_OVER:
            return merge(transfer, initial);
        case MergeStrategy.MERGE_UNDER:
            return merge(initial, transfer);
        default:
            throw Error('Invalid merge strategy must be one of MergeStrategy');
    }
}
