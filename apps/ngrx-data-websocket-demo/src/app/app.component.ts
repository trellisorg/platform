import {
    ChangeDetectionStrategy,
    Component,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { Stories, Story, StoryDataService } from './state/story';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    title = 'ngrx-data-websocket-demo';

    stories$ = this.storyDataService.groupedStories$;

    @ViewChildren('column') columns: QueryList<any>;

    constructor(private storyDataService: StoryDataService) {
        this.storyDataService.connect({});
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

    add(column: number, stories: Stories): void {
        this.storyDataService.add(
            {
                order: stories.length,
                column,
                title: `Order ${stories.length} Column ${column}`,
            },
            { isOptimistic: false }
        );
    }

    delete(story: Story): void {
        this.storyDataService.delete(story);
    }

    update(story: Story, title: string): void {
        this.storyDataService.update({
            id: story.id,
            title,
        });
    }

    queryMany($event): void {
        const search = $event.target.value;
        this.storyDataService.getWithQuery({
            id: search,
            title: search,
        });
    }

    loadAll(): void {
        this.storyDataService.getAll();
    }
}
