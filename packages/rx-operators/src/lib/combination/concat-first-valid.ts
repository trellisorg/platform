import { combineLatest, Observable, OperatorFunction } from 'rxjs';
import { filter, first } from 'rxjs/operators';

export function concatFirstValid<T, K>(
    checkObs: () => Observable<K>,
    checker: (sourceOutput: K) => boolean
): OperatorFunction<T, [T, K]> {
    return (source$): Observable<[T, K]> => {
        return combineLatest([
            source$,
            checkObs().pipe(filter(checker), first()),
        ]);
    };
}
