import { ObserversModule } from '@angular/cdk/observers';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicOutletModule } from '@trellisorg/rx-dynamic-component';
import { ObserveIntersectingModule } from '../observer/observe-intersecting.module';
import { LazyDynamicOutletComponent } from './lazy-dynamic-outlet.component';

@NgModule({
    declarations: [LazyDynamicOutletComponent],
    imports: [
        CommonModule,
        ObserversModule,
        DynamicOutletModule,
        ObserveIntersectingModule,
    ],
    exports: [LazyDynamicOutletComponent],
})
export class LazyDynamicOutletModule {}
