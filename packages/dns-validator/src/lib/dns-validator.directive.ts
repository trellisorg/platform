import { HttpClient } from '@angular/common/http';
import {
    DestroyRef,
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
    private readonly destroyRef = inject(DestroyRef);

    // Signals for state management
    private readonly currentValue = signal<string | undefined>(undefined);
    private readonly debounceTime = computed(() => this.config?.debounceTime ?? 250);
    private debounceTimeout: number | undefined;
    private currentAbortController: AbortController | undefined;

    // State signals
    private readonly responseSignal = signal<DoHResponse | undefined>(undefined);
    private readonly isLoadingSignal = signal<boolean>(false);
    private readonly errorSignal = signal<Error | undefined>(undefined);

    // Computed signals for public API
    readonly response = computed(() => this.responseSignal());
    readonly invalid = computed(() => {
        const response = this.response();
        return response && response.Status !== 0;
    });
    readonly isLoading = computed(() => this.isLoadingSignal());
    readonly error = computed(() => this.errorSignal());

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

        // Effect to handle DNS queries when currentValue changes
        effect(() => {
            const value = this.currentValue();
            if (!value) {
                this.responseSignal.set(undefined);
                this.errorSignal.set(undefined);
                this.isLoadingSignal.set(false);
                return;
            }

            this.performDnsQuery(value);
        });

        // Cleanup timeout and abort controller on destroy
        this.destroyRef.onDestroy(() => {
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            if (this.currentAbortController) {
                this.currentAbortController.abort();
            }
        });
    }

    private defaultTransform(value: string | undefined | null): string | undefined {
        if (!value) {
            return undefined;
        }

        return value.split('@').pop();
    }

    private async performDnsQuery(value: string): Promise<void> {
        // Cancel any existing request
        if (this.currentAbortController) {
            this.currentAbortController.abort();
        }

        // Create new abort controller
        this.currentAbortController = new AbortController();
        const abortSignal = this.currentAbortController.signal;

        // Set loading state
        this.isLoadingSignal.set(true);
        this.errorSignal.set(undefined);

        try {
            const query: DoHQuery = {
                ...this.query(),
                name: value,
            };

            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });

            const response = await fetch(`${googleDoH}?${params.toString()}`, {
                signal: abortSignal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = (await response.json()) as DoHResponse;

            // Only update if request wasn't aborted
            if (!abortSignal.aborted) {
                this.responseSignal.set(data);
                this.isLoadingSignal.set(false);
            }
        } catch (error) {
            // Only update error state if request wasn't aborted
            if (!abortSignal.aborted) {
                this.errorSignal.set(error);
                this.isLoadingSignal.set(false);
                this.responseSignal.set(undefined);
            }
        }
    }

    @HostListener('keyup')
    validateDns(): void {
        const rawValue = this.ngControl.value;
        const transformFn = this.transformFn() ?? this.config?.transformFn ?? this.defaultTransform;
        const transformedValue = transformFn(rawValue);

        if (!transformedValue) {
            this.currentValue.set(undefined);
            return;
        }

        if ((this.requiredValid() && this.ngControl.valid) || !this.requiredValid()) {
            // Clear existing timeout
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }

            // Set new timeout for debouncing
            this.debounceTimeout = setTimeout(() => {
                // Only update if the value hasn't changed during debounce period
                const currentRawValue = this.ngControl.value;
                const currentTransformedValue = transformFn(currentRawValue);

                if (currentTransformedValue === transformedValue) {
                    this.currentValue.set(transformedValue);
                }
                this.debounceTimeout = undefined;
            }, this.debounceTime()) as unknown as number;
        } else {
            // Clear timeout and reset value
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
                this.debounceTimeout = undefined;
            }
            this.currentValue.set(undefined);
        }
    }
}
