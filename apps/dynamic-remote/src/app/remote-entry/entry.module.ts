import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';
import { RemoteEntryComponent } from './entry.component';

@NgModule({
    declarations: [RemoteEntryComponent],
    imports: [CommonModule],
    providers: [{ provide: DYNAMIC_COMPONENT, useValue: RemoteEntryComponent }],
})
export class RemoteEntryModule {}
