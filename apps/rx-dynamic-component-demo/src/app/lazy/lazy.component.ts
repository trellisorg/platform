import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '../dialog/store';

@Component({
    selector: 'ngrx-component-store-example-lazy',
    templateUrl: './lazy.component.html',
    styleUrls: ['./lazy.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyComponent implements OnInit {
    name$ = this.store.name$;

    constructor(private store: Store) {
        this.store.name$.subscribe(console.log);
    }

    ngOnInit(): void {}
}
