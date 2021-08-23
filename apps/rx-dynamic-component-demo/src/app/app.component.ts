import {
    ChangeDetectionStrategy,
    Component,
    ComponentFactory,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import type { QueryParam1Component } from './query-param1/query-param1.component';
import type { QueryParam2Component } from './query-param2/query-param2.component';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    queryParamComponent$: Observable<
        ComponentFactory<QueryParam1Component | QueryParam2Component>
    >;

    selected: string;

    arr = new Array(100).fill(0);

    constructor(
        private _route: ActivatedRoute,
        private rxDynamicComponentService: RxDynamicComponentService,
        private _router: Router
    ) {
        this.queryParamComponent$ = this._route.queryParams.pipe(
            filter((params) => !!params['query']),
            switchMap((params) =>
                this.rxDynamicComponentService.getComponentFactory<
                    QueryParam1Component | QueryParam2Component
                >(params['query'])
            )
        );
    }

    changeQueryParams($event: Event): void {
        this._router.navigate([], {
            queryParams: {
                query: ($event.target as any).value,
            },
        });
    }
}
