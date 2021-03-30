import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryParam1Component } from './query-param1.component';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';

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
