import { InjectionToken, type Provider } from '@angular/core';

export interface DnsValidatorConfig {
    debounceTime?: number;
    transformFn?: (value: string) => string;
}

export const DNS_VALIDATOR_CONFIG = new InjectionToken<DnsValidatorConfig>('DNS_VALIDATOR_CONFIG');

export function provideDnsValidatorConfig(config: DnsValidatorConfig): Provider {
    return {
        provide: DNS_VALIDATOR_CONFIG,
        useValue: config,
    };
}
