import { Component } from '@angular/core';
import { faker } from '@faker-js/faker';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import {
    concat,
    interval,
    map,
    startWith,
    Subject,
    switchMap,
    timer,
} from 'rxjs';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    readonly dynamicRemote$ =
        this.rxDynamicComponentService.getComponent('dynamic-remote');

    readonly dynamicStandaloneComponentType$ =
        this.rxDynamicComponentService.getComponent('dynamic-standalone');

    readonly dynamicModule$ =
        this.rxDynamicComponentService.getComponent('dynamic-module');

    readonly dynamicRenderedAt$ = interval(2000).pipe(
        switchMap(() =>
            concat(
                this.rxDynamicComponentService.getComponent(
                    'dynamic-rendered-at'
                ),
                timer(1000).pipe(
                    switchMap(() =>
                        this.rxDynamicComponentService.getComponent(
                            'dynamic-rendered-at2'
                        )
                    )
                )
            )
        )
    );

    readonly randomNameEverySecond$ = interval(1000).pipe(
        map(() => faker.name.firstName())
    );

    readonly nameStreamFromOutput$ = new Subject<string>();

    readonly show$ = timer(5000).pipe(
        map(() => false),
        startWith(true)
    );

    constructor(private rxDynamicComponentService: RxDynamicComponentService) {}
}
