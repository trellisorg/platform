import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { QueryParam1Component } from './query-param1.component';

@NgModule({
    declarations: [QueryParam1Component],
    exports: [QueryParam1Component],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: QueryParam1Component,
        },
    ],
})
export class QueryParam1Module {}
