import { Component } from '@angular/core';
import { faker } from '@faker-js/faker';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { interval, map, startWith, Subject, timer } from 'rxjs';

@Component({
    selector: 'trellisorg-root',
    template: `
        <div
            style="border: blue dashed 5px; margin-top: 5px"
            *ngIf="show$ | async"
        >
            <div>
                I will remove myself in 5 seconds to demonstrate unsubscribing
                outputs.
            </div>
            <div
                rxDynamic
                inputOutputAdapter
                [name]="randomNameEverySecond$ | async"
                (myName)="nameStreamFromOutput$.next($event)"
                [load]="dynamicStandaloneComponentType$ | async"
            ></div>
            <div>I said my name was: {{ nameStreamFromOutput$ | async }}</div>
        </div>
        <div style="border: orange dashed 5px; margin-top: 5px">
            <div rxDynamic [load]="dynamicModule$ | async"></div>
        </div>
        <div style="border: purple dashed 5px; margin-top: 5px">
            <div>
                Loaded through the manifestId rather than passing in the
                ComponentType directly.
            </div>
            <div
                rxDynamic
                load="dynamic-idle-standalone"
                [config]="{ priority: 'idle' }"
            ></div>
        </div>
    `,
    styles: [],
})
export class AppComponent {
    title = 'rx-dynamic-host';
    readonly dynamicStandaloneComponentType$ =
        this.rxDynamicComponentService.getComponent('dynamic-standalone');

    readonly dynamicModule$ =
        this.rxDynamicComponentService.getComponent('dynamic-module');

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
