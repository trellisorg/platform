import { Component, QueryList, ViewChildren } from '@angular/core';
import { Stories, StoryDataService } from './state/story';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'ngrx-data-websocket-demo';

    stories$ = this.storyDataService.groupedStories$;

    @ViewChildren('column') columns: QueryList<any>;

    constructor(private storyDataService: StoryDataService) {
        this.storyDataService
            .connect({})
            .subscribe(() => this.storyDataService.getAll());
    }

    drop(event: CdkDragDrop<Stories, any>, column: number): void {
        this.storyDataService.update(
            {
                ...event.item.data,
                column,
                order: event.currentIndex,
            },
            { isOptimistic: true }
        );
    }
}
