import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgrxUniversalRehydrateBrowserModule } from '@trellisorg/ngrx-universal-rehydrate';
import { Feature1Component } from './feature1.component';

@NgModule({
    declarations: [Feature1Component],
    imports: [
        NgrxUniversalRehydrateBrowserModule.forFeature(['feature1']),
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: Feature1Component,
            },
        ]),
    ],
    exports: [Feature1Component],
})
export class Feature1Module {}
