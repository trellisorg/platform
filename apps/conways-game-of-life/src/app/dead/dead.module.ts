import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { DeadComponent } from './dead.component';

@NgModule({
    declarations: [DeadComponent],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: DeadComponent,
        },
    ],
    exports: [DeadComponent],
})
export class DeadModule {}
