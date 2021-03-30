import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryParam2Component } from './query-param2.component';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { QueryParam1Component } from '../query-param1/query-param1.component';

@NgModule({
    declarations: [QueryParam2Component],
    exports: [QueryParam2Component],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: QueryParam2Component,
        },
    ],
})
export class QueryParam2Module {}
