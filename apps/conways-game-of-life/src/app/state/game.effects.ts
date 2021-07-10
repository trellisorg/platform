import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { interval } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    nextGeneration,
    selectCurrentGeneration,
    updateGeneration,
} from './game.state';

@Injectable()
export class GameEffects {
    private worker = new Worker(
        new URL('../generation-calc.worker', import.meta.url)
    );

    gameIteration$ = createEffect(() =>
        interval(500).pipe(map(() => nextGeneration()))
    );

    offloadGenerationToWorker$ = createEffect(
        () =>
            this._actions$.pipe(
                ofType(nextGeneration),
                concatLatestFrom(() =>
                    this._store.select(selectCurrentGeneration)
                ),
                tap(([, generation]) => this.worker.postMessage(generation))
            ),
        { dispatch: false }
    );

    constructor(private _actions$: Actions, private _store: Store) {
        this.worker.onmessage = ({ data }: { data: number[][] }) => {
            this._store.dispatch(updateGeneration({ generation: data }));
        };
    }
}
