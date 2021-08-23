import { ObserversModule } from '@angular/cdk/observers';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveComponentModule } from '@ngrx/component';
import { DynamicOutletModule } from '../dynamic-outlet/dynamic-outlet.module';
import { LazyDynamicOutletComponent } from './lazy-dynamic-outlet.component';
import { ObserveIntersectingDirective } from './observe-intersecting.directive';

@NgModule({
    declarations: [LazyDynamicOutletComponent, ObserveIntersectingDirective],
    imports: [
        CommonModule,
        ObserversModule,
        ReactiveComponentModule,
        DynamicOutletModule,
    ],
    exports: [LazyDynamicOutletComponent],
})
export class LazyDynamicOutletModule {}
