import { NgModule } from '@angular/core';
import { DnsValidatorDirective } from './dns-validator.directive';

/**
 * @deprecated Use the standalone DnsValidatorDirective directly instead. This module is kept for backward
 *   compatibility.
 *
 * @example
 *     // Old way (deprecated)
 *     import { DnsValidatorModule } from '@trellisorg/dns-validator';
 *
 * @NgModule({
 *   imports: [DnsValidatorModule]
 * })
 *
 * // New way (recommended)
 * import { DnsValidatorDirective } from '@trellisorg/dns-validator';
 *
 * @Component({
 *   imports: [DnsValidatorDirective]
 * })
 */
@NgModule({
    imports: [DnsValidatorDirective],
    exports: [DnsValidatorDirective],
})
export class DnsValidatorModule {}
