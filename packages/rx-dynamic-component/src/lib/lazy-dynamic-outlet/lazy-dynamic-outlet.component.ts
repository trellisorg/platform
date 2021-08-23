import { Component, ComponentFactory, Input } from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-lazy-dynamic-outlet',
    templateUrl: './lazy-dynamic-outlet.component.html',
    styleUrls: ['./lazy-dynamic-outlet.component.scss'],
})
export class LazyDynamicOutletComponent<T extends Component> {
    @Input() lazyDynamicOutletConfig: IntersectionObserverInit = {
        threshold: [0.25],
        rootMargin: '0px',
    };

    @Input() factory: ComponentFactory<T>;

    intersected = false;

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;
        }
    }
}
