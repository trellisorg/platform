import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentFactory,
    ComponentRef,
    Input,
    Type,
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
export class DynamicOutletComponent<TComponentType extends Type<unknown>, TComponent = InstanceType<TComponentType>>
    implements AfterViewInit
{
    @ViewChild('outlet', { read: ViewContainerRef }) outlet: ViewContainerRef;

    private _factory: ComponentFactory<TComponent>;

    @Input() set factory(factory: ComponentFactory<TComponent>) {
        if (this.outlet) {
            this.loadOutlet(factory);
        }

        this._factory = factory;
    }

    private component: ComponentRef<TComponent>;

    ngAfterViewInit(): void {
        if (this._factory) {
            this.loadOutlet(this._factory);
        }
    }

    loadOutlet(factory: ComponentFactory<TComponent>): void {
        this.outlet.clear();
        this.component = this.outlet.createComponent(factory);
    }
}
