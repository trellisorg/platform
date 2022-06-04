import { Component, Input, Type } from '@angular/core';
import { ObserveIntersectingDirective } from '../observer/observe-intersecting.directive';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-lazy-dynamic-outlet',
    template: `<div
        rxObserveIntersecting
        [debounceTime]="debounceTime"
        [config]="lazyDynamicOutletConfig"
        (visible)="intersected = true"
    >
        <rx-dynamic-outlet
            *ngIf="intersected"
            [load]="load"
        ></rx-dynamic-outlet>
    </div> `,
    styleUrls: [],
    standalone: true,
    imports: [ObserveIntersectingDirective],
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

    @Input() debounceTime = 300;

    intersected = false;

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;
        }
    }
}
