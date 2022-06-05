import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    Injector,
    Input,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-dynamic-outlet',
    template: `<div #outlet></div>`,
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class DynamicOutletComponent<
    TComponent,
    TComponentType extends Type<TComponent>
> implements AfterViewInit
{
    @ViewChild('outlet', { read: ViewContainerRef }) outlet!: ViewContainerRef;

    private _load: TComponentType | null | undefined;

    @Input() set load(factory: TComponentType | null | undefined) {
        if (this.outlet) {
            this.loadOutlet(factory);
        }

        this._load = factory;
    }

    /**
     * Custom injector that will be used in the dynamic component
     */
    @Input() injector?: Injector;

    /**
     * Whether the component should be replaced or added into the `ViewContainerRef` to be rendered
     * alongside the previous dynamic components.
     */
    @Input() replace = true;

    /**
     * If `replace` is false then when inserting into the `ViewContainerRef` this will either create the component
     * at the "start" or the "end".
     */
    @Input() insertAtEnd = true;

    private component?: ComponentRef<TComponent>;

    ngAfterViewInit(): void {
        if (this._load) {
            this.loadOutlet(this._load);
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
    loadOutlet(factory: TComponentType | null | undefined): void {
        if (this.replace) {
            this.outlet.clear();
        }

        if (factory) {
            this.component = this.outlet.createComponent(factory, {
                index: this.insertAtEnd ? undefined : 0,
                injector: this.injector,
            });
        }
    }
}
