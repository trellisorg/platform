import {
    Component,
    ComponentFactory,
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

    private intersected = false;

    loadOutlet(): void {
        this.outlet.clear();
        this.outlet.createComponent(this.factory);
    }

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;
            this.loadOutlet();
        }
    }
}
