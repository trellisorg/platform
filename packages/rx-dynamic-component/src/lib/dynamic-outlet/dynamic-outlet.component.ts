import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
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
        this.outlet.clear();

        if (factory) {
            this.component = this.outlet.createComponent(factory);
        }
    }
}
