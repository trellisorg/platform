import { combineLatest, Observable, OperatorFunction } from 'rxjs';
import { filter, last } from 'rxjs/operators';

export function concatLastValid<T, K>(
    checkObs: () => Observable<K>,
    checker: (sourceOutput: K) => boolean
): OperatorFunction<T, [T, K]> {
    return (source$): Observable<[T, K]> => {
        return combineLatest([
            source$,
            checkObs().pipe(filter(checker), last()),
        ]);
    };
}
