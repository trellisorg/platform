import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveComponentModule } from '@ngrx/component';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { LazyUiModule } from '../lazy-ui/lazy-ui.module';
import { LazyComponent } from './lazy.component';

@NgModule({
    declarations: [LazyComponent],
    imports: [CommonModule, ReactiveComponentModule, LazyUiModule],
    exports: [LazyComponent],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: LazyComponent,
        },
    ],
})
export class LazyModule {}
