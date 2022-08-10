import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { DynamicModuleComponent } from './dynamic-module.component';

@NgModule({
    declarations: [DynamicModuleComponent],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: DynamicModuleComponent,
        },
    ],
})
export class DynamicModuleModule {}
