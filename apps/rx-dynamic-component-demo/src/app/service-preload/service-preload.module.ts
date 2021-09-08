import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { ServicePreloadComponent } from './service-preload.component';

@NgModule({
    declarations: [ServicePreloadComponent],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: ServicePreloadComponent,
        },
    ],
})
export class ServicePreloadModule {}
