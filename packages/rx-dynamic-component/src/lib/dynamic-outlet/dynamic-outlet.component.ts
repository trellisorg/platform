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

    /**
     * Function that will load the new factory into the outlet
     *
     * It will first clear the outlet so that previously rendered factories
     * are cleared and removed from the DOM
     *
     * It will then create the component from the factory using the ViewContainerRef
     *
     * Lastly it will call ChangeDetection on the created component as there are
     * cases where CD is not run right away and the UI is never updated.
     * @param factory
     */
    loadOutlet(factory: ComponentFactory<TComponent>): void {
        this.outlet.clear();

        this.component = this.outlet.createComponent(factory);

        this.component.hostView.detectChanges();
    }
}
