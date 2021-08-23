import { ObserversModule } from '@angular/cdk/observers';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveComponentModule } from '@ngrx/component';
import { DynamicOutletModule } from '../dynamic-outlet/dynamic-outlet.module';
import { ObserveIntersectingModule } from '../observer/observe-intersecting.module';
import { LazyDynamicOutletComponent } from './lazy-dynamic-outlet.component';

@NgModule({
    declarations: [LazyDynamicOutletComponent],
    imports: [
        CommonModule,
        ObserversModule,
        ReactiveComponentModule,
        DynamicOutletModule,
        ObserveIntersectingModule,
    ],
    exports: [LazyDynamicOutletComponent],
})
export class LazyDynamicOutletModule {}
