import {
    Action,
    createAction,
    createFeatureSelector,
    createReducer,
    createSelector,
    on,
} from '@ngrx/store';
import { COLUMNS, ROWS, updateLifeCycle } from './game.utils';

export const GAME_STATE = 'game';

export interface GameState {
    activeGame: number[][];
}

export const initialGameState: GameState = {
    activeGame: (function () {
        const active: number[][] = [];
        for (let i = 0; i < COLUMNS; i++) {
            active.push([]);
            for (let j = 0; j < ROWS; j++) {
                active[i].push(Math.random() > 0.5 ? 1 : 0);
            }
        }

        return active;
    })(),
};

export const gameIteration = createAction('[Game of Life] iteration');

const reducer = createReducer<GameState>(
    initialGameState,
    on(gameIteration, (state) => ({
        ...state,
        activeGame: updateLifeCycle(state.activeGame),
    }))
);

export function gameStateReducer(
    state: GameState | undefined,
    action: Action
): GameState {
    return reducer(state, action);
}

export const selectGameState = createFeatureSelector<GameState>(GAME_STATE);

export const selectActiveGame = createSelector(
    selectGameState,
    (state) => state.activeGame
);
