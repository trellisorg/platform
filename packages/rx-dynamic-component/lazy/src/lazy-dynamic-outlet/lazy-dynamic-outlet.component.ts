import { CommonModule } from '@angular/common';
import { Component, Injector, Input, Type } from '@angular/core';
import { DynamicOutletComponent } from '@trellisorg/rx-dynamic-component';
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
            [injector]="injector"
            [insertAtEnd]="insertAtEnd"
            [replace]="replace"
        ></rx-dynamic-outlet>
    </div> `,
    styleUrls: [],
    standalone: true,
    imports: [
        ObserveIntersectingDirective,
        DynamicOutletComponent,
        CommonModule,
    ],
})
export class LazyDynamicOutletComponent<
    TComponent,
    TComponentType extends Type<TComponent>
> {
    @Input() lazyDynamicOutletConfig: IntersectionObserverInit = {
        threshold: [0.25],
        rootMargin: '0px',
    };

    @Input() load?: Type<TComponentType> | null;

    @Input() debounceTime = 300;

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

    intersected = false;

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;
        }
    }
}
