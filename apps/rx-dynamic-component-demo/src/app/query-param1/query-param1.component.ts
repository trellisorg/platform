import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'trellisorg-query-param1',
    templateUrl: './query-param1.component.html',
    styleUrls: ['./query-param1.component.scss'],
})
export class QueryParam1Component implements OnChanges {
    @Input() set title(title: string) {
        this._title = title;
        console.log(title);
    }

    get title() {
        return this._title;
    }

    _title: string;

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
    }
}
