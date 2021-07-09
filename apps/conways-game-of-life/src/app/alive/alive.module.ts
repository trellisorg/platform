import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { AliveComponent } from './alive.component';

@NgModule({
    declarations: [AliveComponent],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: AliveComponent,
        },
    ],
    exports: [AliveComponent],
})
export class AliveModule {}
