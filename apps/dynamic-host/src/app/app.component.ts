import { Component } from '@angular/core';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { concat, interval, switchMap, timer } from 'rxjs';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    readonly dynamicRemote$ =
        this.rxDynamicComponentService.getComponent('dynamic-remote');

    readonly dynamicStandalone$ =
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

    constructor(private rxDynamicComponentService: RxDynamicComponentService) {}
}
