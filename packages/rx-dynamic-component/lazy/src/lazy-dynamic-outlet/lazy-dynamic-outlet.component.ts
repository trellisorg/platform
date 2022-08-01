import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    Injector,
    Input,
    Type,
} from '@angular/core';
import { RxDynamicDirective } from '@trellisorg/rx-dynamic-component';
import { ObserveIntersectingDirective } from '../observer/observe-intersecting.directive';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rx-lazy-dynamic-outlet',
    template: `<div
        rxObserveIntersecting
        [debounceTime]="debounceTime"
        [config]="lazyDynamicOutletConfig"
        (visible)="elementIntersected()"
    >
        <div
            rxDynamic
            *ngIf="intersected"
            [load]="load"
            [injector]="injector"
            [insertAtEnd]="insertAtEnd"
            [replace]="replace"
        ></div>
    </div> `,
    styleUrls: [],
    standalone: true,
    imports: [ObserveIntersectingDirective, CommonModule, RxDynamicDirective],
})
export class LazyDynamicOutletComponent<
    TComponent,
    TComponentType extends Type<TComponent>
> {
    @Input() lazyDynamicOutletConfig: IntersectionObserverInit = {
        threshold: [0.25],
        rootMargin: '0px',
    };

    @Input() load?: TComponentType | null;

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

    protected intersected = false;

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    elementIntersected(): void {
        if (!this.intersected) {
            this.intersected = true;

            this.changeDetectorRef.markForCheck();
        }
    }
}
