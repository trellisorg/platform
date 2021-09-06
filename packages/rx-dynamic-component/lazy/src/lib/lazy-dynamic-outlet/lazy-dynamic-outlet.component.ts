import { Component, ComponentFactory, Input, Type } from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-lazy-dynamic-outlet',
    templateUrl: './lazy-dynamic-outlet.component.html',
    styleUrls: ['./lazy-dynamic-outlet.component.scss'],
})
export class LazyDynamicOutletComponent<
    TComponentType extends Type<unknown>,
    TComponent = InstanceType<TComponentType>
> {
    @Input() lazyDynamicOutletConfig: IntersectionObserverInit = {
        threshold: [0.25],
        rootMargin: '0px',
    };

    @Input() factory: ComponentFactory<TComponent>;

    intersected = false;

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;
        }
    }
}
