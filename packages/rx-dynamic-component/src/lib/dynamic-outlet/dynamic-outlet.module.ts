import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicOutletComponent } from './dynamic-outlet.component';

@NgModule({
    declarations: [DynamicOutletComponent],
    imports: [CommonModule],
    exports: [DynamicOutletComponent],
})
export class DynamicOutletModule {}
