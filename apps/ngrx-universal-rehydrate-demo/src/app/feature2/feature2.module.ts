import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgrxUniversalRehydrateBrowserModule } from '@trellisorg/ngrx-universal-rehydrate';
import { Feature2Component } from './feature2.component';

@NgModule({
    declarations: [Feature2Component],
    imports: [
        NgrxUniversalRehydrateBrowserModule.forFeature(['feature2']),
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: Feature2Component,
            },
        ]),
    ],
    exports: [Feature2Component],
})
export class Feature2Module {}
