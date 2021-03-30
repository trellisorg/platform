import { Component, ComponentFactory } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { filter, switchMap } from 'rxjs/operators';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    queryParamComponent$: Observable<ComponentFactory<any>>;

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
}
