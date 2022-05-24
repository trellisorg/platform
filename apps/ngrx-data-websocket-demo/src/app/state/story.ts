import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { createSelector, select } from '@ngrx/store';
import {
    SocketCollectionServiceBase,
    SocketServiceElementsFactory,
} from '@trellisorg/ngrx-data-websocket-client';

export class Story {
    id?: string;
    order: number;
    column: number;
    title: string;
}

export type Stories = Story[];

@Injectable({
    providedIn: 'root',
})
export class StoryDataService extends SocketCollectionServiceBase<Story> {
    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        socketServiceElementsFactory: SocketServiceElementsFactory<Story>
    ) {
        super('Story', serviceElementsFactory, socketServiceElementsFactory);
    }

    groupedStories$ = this.entities$.pipe(select(selectStories));
}

export const selectStories = createSelector(
    (stories) => stories,
    (stories: Stories) =>
        stories.reduce(
            (prev, cur) => {
                prev[cur.column].push(cur);

                prev[cur.column].sort((a, b) => a.order - b.order);

                return prev;
            },
            [[], [], [], []]
        )
);
