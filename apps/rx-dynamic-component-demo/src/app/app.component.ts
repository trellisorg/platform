import { AfterViewInit, Component, ComponentFactory } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
    queryParamComponent$: Observable<ComponentFactory<any>>;

    selected: string;

    data: { title: string };

    constructor(
        private _route: ActivatedRoute,
        private rxDynamicComponentService: RxDynamicComponentService,
        private _router: Router
    ) {
        this.queryParamComponent$ = this._route.queryParams.pipe(
            filter((params) => !!params['query']),
            switchMap((params) =>
                this.rxDynamicComponentService.getComponentFactory(
                    params['query']
                )
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

    ngAfterViewInit(): void {
        setTimeout(() => (this.data = { title: 'new title' }), 5000);
    }
}
