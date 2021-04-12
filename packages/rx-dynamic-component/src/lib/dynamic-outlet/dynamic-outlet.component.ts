import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentFactory,
    Input,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

@Component({
    selector: 'rx-dynamic-outlet',
    templateUrl: './dynamic-outlet.component.html',
    styleUrls: ['./dynamic-outlet.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicOutletComponent implements AfterViewInit {
    @ViewChild('outlet', { read: ViewContainerRef }) outlet: ViewContainerRef;

    private _factory: ComponentFactory<any>;

    @Input() set factory(factory: ComponentFactory<any>) {
        if (this.outlet) {
            this.loadOutlet(factory);
        }

        this._factory = factory;
    }

    ngAfterViewInit(): void {
        if (this._factory) {
            this.loadOutlet(this._factory);
        }
    }

    loadOutlet(factory: ComponentFactory<any>): void {
        this.outlet.clear();
        this.outlet.createComponent(factory);
    }
}
