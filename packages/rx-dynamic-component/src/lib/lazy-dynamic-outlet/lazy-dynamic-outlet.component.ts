import {
    Component,
    ComponentFactory,
    ComponentRef,
    Input,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-lazy-dynamic-outlet',
    templateUrl: './lazy-dynamic-outlet.component.html',
    styleUrls: ['./lazy-dynamic-outlet.component.scss'],
})
export class LazyDynamicOutletComponent<T extends Component> {
    @ViewChild('outlet', { read: ViewContainerRef }) outlet: ViewContainerRef;

    @Input('lazyDynamicOutletConfig') config: IntersectionObserverInit = {
        threshold: [0.25],
        rootMargin: '0px',
    };

    @Input() set data(data: Partial<T>) {
        this._data = data;

        this.setData();
    }

    get data(): Partial<T> {
        return this._data;
    }

    @Input() set factory(factory: ComponentFactory<T>) {
        this._factory = factory;

        if (this.intersected) {
            this.loadOutlet();
        }
    }

    get factory(): ComponentFactory<T> {
        return this._factory;
    }

    private _factory: ComponentFactory<T>;

    private _data: Partial<T>;

    private intersected = false;

    private component: ComponentRef<T>;

    loadOutlet(): void {
        this.outlet.clear();
        this.component = this.outlet.createComponent(this.factory);

        this.setData();
    }

    setData(): void {
        if (this.data && this.component) {
            const instance = this.component.instance;

            Object.entries(this.data).forEach(
                ([key, value]) => (instance[key] = value)
            );
        }
    }

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;
            this.loadOutlet();
        }
    }
}
