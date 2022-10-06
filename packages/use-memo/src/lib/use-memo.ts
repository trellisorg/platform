import { inject, InjectionToken, Provider } from '@angular/core';
import { memoize } from './memoize';
import type { MemoizableFunction, MemoizedFunction } from './types';

export interface UseMemoConfig {
    /**
     * The number of different calls of the function to be cached.
     */
    limit?: number;
}

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
export const useMemo = <Fn extends MemoizableFunction>(fn: Fn, config: UseMemoConfig = {}): MemoizedFunction<Fn> => {
    const tokenConfig = inject(USE_MEMO_CONFIG, { optional: true });

    return memoize(config.limit ?? tokenConfig?.limit ?? 10)(fn);
};
