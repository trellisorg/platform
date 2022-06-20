import { NgModule } from '@angular/core';
import { DnsValidatorDirective } from './dns-validator.directive';

@NgModule({
    declarations: [DnsValidatorDirective],
    exports: [DnsValidatorDirective],
})
export class DnsValidatorModule {}
