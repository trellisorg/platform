import { Component } from '@angular/core';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    readonly dynamicRemote$ =
        this.rxDynamicComponentService.getComponentFactory('dynamic-remote');

    constructor(private rxDynamicComponentService: RxDynamicComponentService) {}
}
