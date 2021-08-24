import { Component, ComponentFactory, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import type { Observable } from 'rxjs';
import { Store } from './store';

@Component({
    selector: 'ngrx-component-store-example-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
    factory$: Observable<ComponentFactory<any>> =
        this.rxDynamicComponentService.getComponentFactory('lazy');

    constructor(
        private _store: Store,
        @Inject(MAT_BOTTOM_SHEET_DATA) data: { name: string },
        private rxDynamicComponentService: RxDynamicComponentService
    ) {
        this._store.setState({ name: data.name });
    }

    ngOnInit(): void {}
}
