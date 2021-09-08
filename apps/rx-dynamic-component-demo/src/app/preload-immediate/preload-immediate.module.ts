import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { PreloadImmediateComponent } from './preload-immediate.component';

@NgModule({
    declarations: [PreloadImmediateComponent],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: PreloadImmediateComponent,
        },
    ],
})
export class PreloadImmediateModule {}
