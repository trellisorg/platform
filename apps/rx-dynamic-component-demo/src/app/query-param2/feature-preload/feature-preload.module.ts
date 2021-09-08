import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { FeaturePreloadComponent } from './feature-preload.component';

@NgModule({
    declarations: [FeaturePreloadComponent],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: FeaturePreloadComponent,
        },
    ],
})
export class FeaturePreloadModule {}
