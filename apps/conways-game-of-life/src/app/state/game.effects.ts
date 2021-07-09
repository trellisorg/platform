import { Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { nextGeneration } from './game.state';

@Injectable()
export class GameEffects {
    gameIteration$ = createEffect(() =>
        interval(500).pipe(map(() => nextGeneration()))
    );

    constructor() {}
}
