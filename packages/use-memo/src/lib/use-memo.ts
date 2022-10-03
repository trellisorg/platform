import { inject, InjectionToken, Provider } from '@angular/core';
import { memoize } from './memoize';

export interface UseMemoConfig {
    /**
     * The number of different calls of the function to be cached.
     */
    limit?: number;
}

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
export const useMemo = (fn: MemoizableFunction, config: UseMemoConfig = {}) => {
    const tokenConfig = inject(USE_MEMO_CONFIG, { optional: true });

    return memoize(config.limit ?? tokenConfig?.limit ?? 10)(fn);
};

/**
 * @description Method decorator for memoizing the result of a method on a class
 *
 * @param config
 * @constructor
 */
export function UseMemo(config: UseMemoConfig = {}) {
    return (target: unknown, propertyName: string, descriptor: TypedPropertyDescriptor<MemoizableFunction>) => {
        const fn = descriptor.value as (...args: unknown[]) => unknown;

        descriptor.value = memoize(config.limit ?? 10)(fn);

        return descriptor;
    };
}
