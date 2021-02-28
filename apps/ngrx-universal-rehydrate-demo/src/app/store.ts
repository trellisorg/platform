import {
    Action,
    createAction,
    createReducer,
    createSelector,
    on,
    props,
    State,
} from '@ngrx/store';

export const setServer = createAction('server action', props<{ data: any }>());

const reducer = createReducer(
    {},
    on(setServer, (state, payload) => ({ ...state, ...payload.data }))
);

export function titleReducer(state: State<any> | undefined, action: Action) {
    return reducer(state, action);
}

export const selectTitle = createSelector(
    (state: any) => state.titleState,
    (title) => title?.title
);
