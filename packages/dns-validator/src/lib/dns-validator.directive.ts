import { HttpClient } from '@angular/common/http';
import {
    Directive,
    ElementRef,
    HostListener,
    Renderer2,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, of, catchError, startWith } from 'rxjs';
import { DNS_VALIDATOR_CONFIG } from './dns-validator.config';

type DoHBoolean = boolean | '1' | '0' | 0 | 1;

export interface DoHQuery {
    name: string;
    type?: string;
    cd?: DoHBoolean;
    ct?: string;
    do?: DoHBoolean;
    edns_client_subnet?: string;
    random_padding?: string;
}

export interface DoHResponse {
    Status: 0 | 1 | 2 | 3; // NOERROR - Standard DNS response code (32 bit integer).
}

const googleDoH = 'https://dns.google/resolve';
const formClass = 'form-control-warning';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'input[dns]',
    exportAs: 'dns',
    standalone: true,
})
export class DnsValidatorDirective {
    // Modern Angular inputs using input() function
    readonly query = input<Omit<DoHQuery, 'name'>>({});
    readonly requiredValid = input<boolean>(true);
    readonly transformFn = input<((value: string) => string) | undefined>();

    // Injected dependencies
    private readonly httpClient = inject(HttpClient);
    private readonly ngControl = inject(NgControl);
    private readonly elementRef = inject(ElementRef);
    private readonly renderer2 = inject(Renderer2);
    private readonly config = inject(DNS_VALIDATOR_CONFIG, { optional: true });

    // Single signal for the domain value to query
    private readonly domainToQuery = signal<string | undefined>(undefined);

    // DNS query observable that reacts to domain changes
    private readonly dnsQuery$ = toSignal(
        toObservable(this.domainToQuery).pipe(
            debounceTime(this.config?.debounceTime ?? 250),
            switchMap(domain => {
                if (!domain) {
                    return of(undefined);
                }

                const query: DoHQuery = {
                    ...this.query(),
                    name: domain,
                };

                const params = new URLSearchParams();
                Object.entries(query).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, String(value));
                    }
                });

                return this.httpClient.get<DoHResponse>(`${googleDoH}?${params.toString()}`).pipe(
                    catchError(() => of(undefined))
                );
            }),
            startWith(undefined)
        ),
        { initialValue: undefined }
    );

    // Public API - simple computed signals
    readonly response = computed(() => this.dnsQuery$());
    readonly isLoading = signal(false); // Simplified - toSignal doesn't provide loading state
    readonly error = signal<Error | undefined>(undefined); // Simplified - errors are caught and return undefined
    readonly invalid = computed(() => {
        const response = this.response();
        return response && response.Status !== 0;
    });

    constructor() {
        // Effect to handle CSS class updates based on validation status
        effect(() => {
            const isInvalid = this.invalid();
            const element = this.elementRef.nativeElement;

            if (isInvalid) {
                this.renderer2.addClass(element, formClass);
            } else {
                this.renderer2.removeClass(element, formClass);
            }
        });
    }

    private defaultTransform(value: string | undefined | null): string | undefined {
        if (!value) {
            return undefined;
        }

        return value.split('@').pop();
    }



    @HostListener('keyup')
    validateDns(): void {
        const rawValue = this.ngControl.value;
        const transformFn = this.transformFn() ?? this.config?.transformFn ?? this.defaultTransform;
        const transformedValue = transformFn(rawValue);

        if (!transformedValue) {
            this.domainToQuery.set(undefined);
            return;
        }

        if ((this.requiredValid() && this.ngControl.valid) || !this.requiredValid()) {
            this.domainToQuery.set(transformedValue);
        } else {
            this.domainToQuery.set(undefined);
        }
    }
}
