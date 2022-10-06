import { inject, InjectionToken, Provider } from '@angular/core';
import { memoize } from './memoize';

export interface UseMemoConfig {
    /**
     * The number of different calls of the function to be cached.
     */
    limit?: number;
}

export type MemoizedFunction<T extends (...args: any[]) => any> = T & {
    limit: number;
    wasMemoized: boolean;
    cache: Map<any, any>;
    lru: any;
};

export type MemoizableFunction = (...args: any[]) => any;

export const USE_MEMO_CONFIG = new InjectionToken<UseMemoConfig>('[@trellisorg/use-memo] config');

/**
 * @description Configure the dependency provider so that different instances of `useMemo` all share the same config
 *
 * @param config
 */
export function configureUseMemo(config: UseMemoConfig): Provider {
    return {
        provide: USE_MEMO_CONFIG,
        useValue: config,
    };
}

/**
 * @description Plain function that uses the config token and memoizes a function on a class.
 *
 * @param fn
 * @param config
 */
export const useMemo = <Fn extends MemoizableFunction>(fn: Fn, config: UseMemoConfig = {}) => {
    const tokenConfig = inject(USE_MEMO_CONFIG, { optional: true });

    return memoize(config.limit ?? tokenConfig?.limit ?? 10)(fn) as MemoizedFunction<Fn>;
};
