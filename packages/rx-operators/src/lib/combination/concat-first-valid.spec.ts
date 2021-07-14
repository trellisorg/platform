import { hot } from 'jest-marbles';
import { from, of } from 'rxjs';
import { concatFirstValid } from './concat-first-valid';

describe('withLatestValid', () => {
    it('should emit with just a single valid observable from([1])', () => {
        const validObs$ = from([1]);

        expect(
            of('initial').pipe(
                concatFirstValid(
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
                concatFirstValid(
                    () => validObs$,
                    (value) => value === 1
                )
            )
        ).toBeObservable(hot('(a|)', { a: ['initial', 1] }));
    });

    it('should with an array of invalid values followed by one valid value', () => {
        const validObs$ = from([4, 5, 6, 7, 8, 1]);

        expect(
            of('initial').pipe(
                concatFirstValid(
                    () => validObs$,
                    (value) => value === 1
                )
            )
        ).toBeObservable(hot('(a|)', { a: ['initial', 1] }));
    });
});
