import { Component, Input, Type } from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-lazy-dynamic-outlet',
    templateUrl: './lazy-dynamic-outlet.component.html',
    styleUrls: ['./lazy-dynamic-outlet.component.scss'],
})
export class LazyDynamicOutletComponent<
    TComponent,
    TComponentType extends Type<TComponent>
> {
    @Input() lazyDynamicOutletConfig: IntersectionObserverInit = {
        threshold: [0.25],
        rootMargin: '0px',
    };

    @Input() load: Type<TComponentType>;

    intersected = false;

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;
        }
    }
}
