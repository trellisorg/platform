import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { PreloadIdleComponent } from './preload-idle.component';

@NgModule({
    declarations: [PreloadIdleComponent],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: PreloadIdleComponent,
        },
    ],
})
export class PreloadIdleModule {}
