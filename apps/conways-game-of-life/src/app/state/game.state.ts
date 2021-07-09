import { createAction, createFeature, createReducer, on } from '@ngrx/store';
import { COLUMNS, ROWS, updateLifeCycle } from './game.utils';

export const GAME_STATE = 'game';

export interface GameState {
    currentGeneration: number[][];
    generation: number;
}

export const nextGeneration = createAction('[Game of Life] iteration');

export const initialGameState: GameState = {
    currentGeneration: (function () {
        const active: number[][] = [];
        for (let i = 0; i < COLUMNS; i++) {
            active.push([]);
            for (let j = 0; j < ROWS; j++) {
                active[i].push(Math.random() > 0.5 ? 1 : 0);
            }
        }

        return active;
    })(),
    generation: 0,
};

const reducer = createReducer<GameState>(
    initialGameState,
    on(nextGeneration, (state) => ({
        ...state,
        currentGeneration: updateLifeCycle(state.currentGeneration),
        generation: state.generation + 1,
    }))
);

export const gameFeature = createFeature({
    name: GAME_STATE,
    reducer: reducer,
});

export const {
    selectCurrentGeneration,
    selectGeneration,
    reducer: gameReducer,
} = gameFeature;
