import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { map } from 'rxjs/operators';
import { Store } from './store';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'ngrx-component-store-example-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    readonly factory$ = this.rxDynamicComponentService.getComponent('lazy');

    state$ = this._store.state$.pipe(map(Boolean));

    constructor(
        private _store: Store,
        @Inject(MAT_BOTTOM_SHEET_DATA) data: { name: string },
        private rxDynamicComponentService: RxDynamicComponentService
    ) {
        this._store.setState({ name: data.name });
    }
}
