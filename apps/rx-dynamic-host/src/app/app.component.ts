import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faker } from '@faker-js/faker';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { provideRxDynamicEventLoadManifests } from '@trellisorg/rx-dynamic-component/template';
import { interval, map, startWith, Subject, timer } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component';

@Component({
    selector: 'trellisorg-root',
    template: `
        <div *ngIf="show$ | async" style="border: blue dashed 5px; margin-top: 5px">
            <div>I will remove myself in 5 seconds to demonstrate unsubscribing outputs.</div>
            <div
                [name]="randomNameEverySecond$ | async"
                (myName)="nameStreamFromOutput$.next($event.value.data)"
                load="dynamic-standalone"
                rxDynamic
                inputOutputAdapter
            ></div>
            <div>I said my name was: {{ nameStreamFromOutput$ | async }}</div>
        </div>
        <div
            [name]="randomDogEverySecond$ | async"
            (myName)="nameStreamFromOutput2$.next($event.value.data)"
            load="dynamic-standalone2"
            rxDynamic
            inputOutputAdapter
        ></div>
        <div style="border: orange dashed 5px; margin-top: 5px">
            <div [load]="dynamicModule$ | async" rxDynamic></div>
        </div>
        <div style="border: purple dashed 5px; margin-top: 5px">
            <div>Loaded through the manifestId rather than passing in the ComponentType directly.</div>
            <div [config]="{ priority: 'idle' }" rxDynamic load="dynamic-idle-standalone"></div>
        </div>
        <button (click)="open()">Open</button>
        <div style="border: green dashed 5px; margin-top: 5px" rxDynamicLoad>
            Hovering on me will preload a manifest
        </div>
    `,
    providers: [provideRxDynamicEventLoadManifests('dynamic-event-load')],
})
export class AppComponent {
    readonly dynamicModule$ = this.rxDynamicComponentService.getComponent('dynamic-module');

    readonly randomNameEverySecond$ = interval(1000).pipe(map(() => faker.name.firstName()));

    readonly randomDogEverySecond$ = interval(1000).pipe(map(() => faker.animal.dog()));

    readonly nameStreamFromOutput$ = new Subject<string>();

    readonly nameStreamFromOutput2$ = new Subject<string>();

    readonly show$ = timer(5000).pipe(
        map(() => false),
        startWith(true)
    );

    constructor(private rxDynamicComponentService: RxDynamicComponentService, private matDialog: MatDialog) {}

    open() {
        this.matDialog.open(DialogComponent);
    }
}
