import { NgModule } from '@angular/core';
import { ObserveIntersectingDirective } from './observe-intersecting.directive';

@NgModule({
    declarations: [ObserveIntersectingDirective],
    exports: [ObserveIntersectingDirective],
})
export class ObserveIntersectingModule {}
