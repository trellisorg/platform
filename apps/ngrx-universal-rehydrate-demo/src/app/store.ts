import {
    Action,
    createAction,
    createReducer,
    createSelector,
    on,
    props,
    State,
} from '@ngrx/store';

export interface Item {
    title: string;
    description: string;
}

export const loadData = createAction('load data');

export const setData = createAction('set data', props<{ data: Item[] }>());

const reducer = createReducer(
    {},
    on(setData, (state, payload) => ({ ...state, items: payload.data }))
);

export function titleReducer(state: State<any> | undefined, action: Action) {
    return reducer(state, action);
}

export const selectData = createSelector(
    (state: any) => state.root,
    (state) => state.items
);
