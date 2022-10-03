// eslint-disable-next-line @typescript-eslint/no-var-requires
const MapOrSimilar = require('map-or-similar');

export interface LRUPath {
    cacheItem: any;
    arg: unknown;
}

export type LRU = LRUPath[][];

export function memoize(limit: number) {
    const cache = new MapOrSimilar();
    const lru: LRUPath[][] = [];

    return function (fn: (...args: unknown[]) => unknown) {
        const memoizerific = function (...args: unknown[]) {
            let currentCache = cache;
            let newMap;
            let fnResult;
            const numArgs = args.length;
            const argsLengthMinusOne = args.length - 1;
            const lruPath: LRUPath[] = new Array(numArgs).fill(undefined);

            let isMemoized = true;
            let i;

            if ((numArgs || numArgs === 0) && numArgs !== argsLengthMinusOne + 1) {
                throw new Error('Memoizerific functions should always be called with the same number of arguments');
            }

            // loop through each argument to traverse the map tree
            for (i = 0; i < argsLengthMinusOne; i++) {
                lruPath[i] = {
                    cacheItem: currentCache,
                    arg: args[i],
                };

                // climb through the hierarchical map tree until the second-last argument has been found, or an argument is missing.
                // if all arguments up to the second-last have been found, this will potentially be a cache hit (determined later)
                if (currentCache.has(args[i])) {
                    currentCache = currentCache.get(args[i]);
                    continue;
                }

                isMemoized = false;

                // make maps until last value
                newMap = new MapOrSimilar();
                currentCache.set(args[i], newMap);
                currentCache = newMap;
            }

            // we are at the last arg, check if it is really memoized
            if (isMemoized) {
                if (currentCache.has(args[argsLengthMinusOne])) {
                    fnResult = currentCache.get(args[argsLengthMinusOne]);
                } else {
                    isMemoized = false;
                }
            }

            // if the result wasn't memoized, compute it and cache it
            if (!isMemoized) {
                // eslint-disable-next-line prefer-spread
                fnResult = fn.apply(null, args);
                currentCache.set(args[argsLengthMinusOne], fnResult);
            }

            // if there is a cache limit, purge any extra results
            if (limit > 0) {
                lruPath[argsLengthMinusOne] = {
                    cacheItem: currentCache,
                    arg: args[argsLengthMinusOne],
                };

                if (isMemoized) {
                    moveToMostRecentLru(lru, lruPath);
                } else {
                    lru.push(lruPath);
                }

                if (lru.length > limit) {
                    removeCachedResult(lru.shift());
                }
            }

            memoizerific.wasMemoized = isMemoized;

            return fnResult;
        };

        memoizerific.limit = limit;
        memoizerific.wasMemoized = false;
        memoizerific.cache = cache;
        memoizerific.lru = lru;

        return memoizerific;
    };
}

/**
 * @description move current args to most recent position
 * @param lru
 * @param lruPath
 */
function moveToMostRecentLru(lru: LRU, lruPath: LRUPath[]): void {
    const lruLen = lru.length;
    const lruPathLen = lruPath.length;
    let isMatch;
    let i;
    let ii;

    for (i = 0; i < lruLen; i++) {
        isMatch = true;
        for (ii = 0; ii < lruPathLen; ii++) {
            if (!isEqual(lru[i][ii].arg, lruPath[ii].arg)) {
                isMatch = false;
                break;
            }
        }
        if (isMatch) {
            break;
        }
    }

    lru.push(lru.splice(i, 1)[0]);
}

/**
 * @description remove least recently used cache item and all dead branches
 *
 * @param removedLru
 */
function removeCachedResult(removedLru: LRUPath[] | undefined): void {
    if (!removedLru) {
        return;
    }

    const removedLruLen = removedLru.length;
    let currentLru = removedLru[removedLruLen - 1];
    let tmp;
    let i;

    currentLru.cacheItem.delete(currentLru.arg);

    // walk down the tree removing dead branches (size 0) along the way
    for (i = removedLruLen - 2; i >= 0; i--) {
        currentLru = removedLru[i];
        tmp = currentLru.cacheItem.get(currentLru.arg);

        if (!tmp || !tmp.size) {
            currentLru.cacheItem.delete(currentLru.arg);
        } else {
            break;
        }
    }
}

/**
 * @description Check if the args are equal, or whether they are both precisely NaN (isNaN returns true for all non-numbers)
 *
 * @param val1
 * @param val2
 */
function isEqual(val1: unknown, val2: unknown): boolean {
    return val1 === val2 || (val1 !== val1 && val2 !== val2);
}
