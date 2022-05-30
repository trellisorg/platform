import { Component } from '@angular/core';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';

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

    constructor(private rxDynamicComponentService: RxDynamicComponentService) {}
}
