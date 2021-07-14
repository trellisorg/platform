import { hot } from 'jest-marbles';
import { from, of } from 'rxjs';
import { concatLastValid } from './concat-last-valid';

describe('concatLastValid', () => {
    it('should emit with just a single valid observable from([1])', () => {
        const validObs$ = from([1]);

        expect(
            of('initial').pipe(
                concatLastValid(
                    () => validObs$,
                    (value) => value === 1
                )
            )
        ).toBeObservable(hot('(a|)', { a: ['initial', 1] }));
    });

    it('should emit with just a single valid observable of(1)', () => {
        const validObs$ = of(1);

        expect(
            of('initial').pipe(
                concatLastValid(
                    () => validObs$,
                    (value) => value === 1
                )
            )
        ).toBeObservable(hot('(a|)', { a: ['initial', 1] }));
    });

    it('should emit the last valid value in an array', () => {
        const validObs$ = from([4, 5, 6, 7, 8, 1]);

        expect(
            of('initial').pipe(
                concatLastValid(
                    () => validObs$,
                    (value) => value === 1 || value === 8
                )
            )
        ).toBeObservable(hot('(a|)', { a: ['initial', 1] }));
    });
});
