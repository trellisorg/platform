import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';

@Component({
    selector: 'ngrx-component-store-example-lazy-ui',
    templateUrl: './lazy-ui.component.html',
    styleUrls: ['./lazy-ui.component.scss'],
})
export class LazyUiComponent implements OnInit, OnChanges {
    @Input() name!: string;

    constructor() {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges) {
        console.log(changes);
    }
}
