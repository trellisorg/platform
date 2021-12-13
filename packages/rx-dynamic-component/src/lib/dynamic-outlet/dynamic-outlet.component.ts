import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Input,
    Type,
    ViewChild,
    ViewContainerRef,
    ɵComponentDef,
    ɵComponentType,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-dynamic-outlet',
    templateUrl: './dynamic-outlet.component.html',
    styleUrls: ['./dynamic-outlet.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicOutletComponent<
    TData extends unknown,
    TComponent extends unknown,
    TComponentType extends Type<TComponent>,
    TComponentInstance = InstanceType<TComponentType>
> implements AfterViewInit
{
    @ViewChild('outlet', { read: ViewContainerRef }) outlet: ViewContainerRef;

    private _componentType: TComponentType;

    @Input() set componentType(componentType: TComponentType) {
        if (this.outlet) {
            this.loadOutlet(componentType);
        }

        this._componentType = componentType;
    }

    @Input() set data(data: TData) {
        this._data = data;

        this.setComponentData(this.data);
    }

    get data(): any {
        return this._data;
    }

    private _data: TData;

    private inputs: {
        [P in keyof TComponentInstance]: string;
    };

    private changeDetectorRef: ChangeDetectorRef;

    private component: ComponentRef<TComponent>;

    ngAfterViewInit(): void {
        if (this._componentType) {
            this.loadOutlet(this._componentType);
        }
    }

    private setComponentData(data: TData): void {
        if (this.component && data) {
            Object.entries(data).forEach(([key, value]) => {
                if (this.inputs[key]) {
                    this.component.instance[key] = value;
                } else {
                    console.warn(`Cannot set properties that are not inputs.`);
                }
            });

            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * Function that will load the new factory into the outlet
     *
     * It will first clear the outlet so that previously rendered factories
     * are cleared and removed from the DOM
     *
     * It will then create the component from the factory using the ViewContainerRef
     * @param tComponent
     */
    loadOutlet(tComponent: TComponentType): void {
        this.outlet.clear();

        this.component = this.outlet.createComponent(tComponent);

        this.changeDetectorRef = this.component.injector.get(ChangeDetectorRef);

        this.inputs = (
            (this.component.componentType as ɵComponentType<TComponentInstance>)
                .ɵcmp as ɵComponentDef<TComponentInstance>
        ).inputs;

        this.setComponentData(this.data);
    }
}
