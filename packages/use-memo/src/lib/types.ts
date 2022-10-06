export type MemoizedFunction<T extends (...args: any[]) => any> = T & {
    limit: number;
    wasMemoized: boolean;
    cache: Map<any, any>;
    lru: any;
};

export type MemoizableFunction = (...args: any[]) => any;
