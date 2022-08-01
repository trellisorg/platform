import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import {
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    tap,
} from 'rxjs/operators';
import { DialogComponent } from './dialog/dialog.component';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    readonly queryParamComponent$ = this._route.queryParams.pipe(
        filter((params) => !!params['query']),
        map((params) => params['query']),
        distinctUntilChanged(),
        tap(console.log),
        switchMap((manifestId) =>
            this.rxDynamicComponentService.getComponent(manifestId)
        )
    );

    selected: string;

    arr = new Array(100).fill(0);

    constructor(
        private _route: ActivatedRoute,
        private rxDynamicComponentService: RxDynamicComponentService,
        private _router: Router,
        private _matBottomSheet: MatBottomSheet
    ) {
        // firstValueFrom(
        //     this.rxDynamicComponentService.getComponent('service-preload')
        // );
    }

    changeQueryParams($event: Event): void {
        this._router.navigate([], {
            queryParams: {
                query: ($event.target as HTMLSelectElement).value,
            },
        });
    }
    open() {
        this._matBottomSheet.open(DialogComponent, {
            data: {
                name: 'Jay',
            },
        });
    }
}
