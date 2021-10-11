import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
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
    TComponentType extends Type<unknown>,
    TComponent = InstanceType<TComponentType>
> implements AfterViewInit
{
    @ViewChild('outlet', { read: ViewContainerRef }) outlet: ViewContainerRef;

    private _factory: ComponentFactory<TComponent>;

    @Input() set factory(factory: ComponentFactory<TComponent>) {
        if (this.outlet) {
            this.loadOutlet(factory);
        }

        this._factory = factory;
    }

    @Input() set data(data: any) {
        this._data = data;

        this.setComponentData(this.data);
    }

    get data(): any {
        return this._data;
    }

    private _data: any;

    private component: ComponentRef<TComponent>;

    private inputs: {
        [P in keyof TComponent]: string;
    };

    private changeDetectorRef: ChangeDetectorRef;

    constructor(private _changeDetectorEef: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        if (this._factory) {
            this.loadOutlet(this._factory);
        }
    }

    private setComponentData<T extends any>(data: T): void {
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
     * @param factory
     */
    loadOutlet(factory: ComponentFactory<TComponent>): void {
        this.outlet.clear();

        this.component = this.outlet.createComponent(factory);

        this.changeDetectorRef = this.component.injector.get(ChangeDetectorRef);

        this.inputs = (
            (this.component.componentType as ɵComponentType<TComponent>)
                .ɵcmp as ɵComponentDef<TComponent>
        ).inputs;

        this.setComponentData(this.data);
    }
}
