import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentFactory,
    Input,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-dynamic-outlet',
    templateUrl: './dynamic-outlet.component.html',
    styleUrls: ['./dynamic-outlet.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicOutletComponent<T extends Component>
    implements AfterViewInit
{
    @ViewChild('outlet', { read: ViewContainerRef }) outlet: ViewContainerRef;

    private _factory: ComponentFactory<T>;

    @Input() set factory(factory: ComponentFactory<T>) {
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

    loadOutlet(factory: ComponentFactory<T>): void {
        this.outlet.clear();
        this.outlet.createComponent(factory);
    }
}
