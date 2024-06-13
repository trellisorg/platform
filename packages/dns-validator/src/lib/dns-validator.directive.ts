import { HttpClient, HttpParams } from '@angular/common/http';
import { Directive, ElementRef, HostListener, Injectable, Input, Renderer2, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { debounceTime, map, switchMap, type Observable } from 'rxjs';
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

const googleDoH = `https://dns.google/resolve`;
const formClass = 'form-control-warning';

interface DnsValidatorState {
    response?: DoHResponse;
}

@Injectable()
class DnsValidatorStore extends ComponentStore<DnsValidatorState> {
    private readonly config = inject(DNS_VALIDATOR_CONFIG, { optional: true });

    readonly response$ = this.select((state) => state.response);

    readonly invalid$ = this.response$.pipe(map((response) => response && response.Status !== 0));

    readonly clear = this.updater((state) => ({
        ...state,
        response: undefined,
    }));

    readonly queryDns = this.effect((query$: Observable<DoHQuery>) =>
        query$.pipe(
            debounceTime(this.config?.debounceTime ?? 250),
            switchMap((query) =>
                this._httpClient.get<DoHResponse>(`${googleDoH}`, {
                    params: {
                        ...query,
                    } as unknown as HttpParams,
                })
            ),
            tapResponse(
                (response) => {
                    this.patchState({
                        response,
                    });

                    this.processStatus(response.Status);
                },
                () => {
                    this.patchState({
                        response: undefined,
                    });

                    this.processStatus(0);
                }
            )
        )
    );

    constructor(
        private readonly _httpClient: HttpClient,
        private readonly elementRef: ElementRef,
        private readonly _renderer2: Renderer2
    ) {
        super();
    }

    private processStatus(status: DoHResponse['Status']): void {
        if (status === 0) {
            this._renderer2.removeClass(this.elementRef.nativeElement, formClass);
        } else {
            this._renderer2.addClass(this.elementRef.nativeElement, formClass);
        }
    }
}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'input[dns]',
    providers: [DnsValidatorStore],
    exportAs: 'dns',
})
export class DnsValidatorDirective {
    @Input() query?: Omit<DoHQuery, 'name'> = {};

    @Input() requiredValid = true;

    @Input() transformFn?: (value: string) => string;

    readonly response$ = this.dnsValidatorStore.response$;

    readonly invalid$ = this.dnsValidatorStore.invalid$;

    private readonly config = inject(DNS_VALIDATOR_CONFIG, 8);

    constructor(
        private readonly ngControl: NgControl,
        private readonly dnsValidatorStore: DnsValidatorStore
    ) {
        this.dnsValidatorStore.setState({});
    }

    private defaultTransform(value: string | undefined | null): string | undefined {
        if (!value) {
            return undefined;
        }

        return value.split('@').pop();
    }

    @HostListener('keyup')
    async validateDns(): Promise<void> {
        const value = (this.transformFn ?? this.config?.transformFn ?? this.defaultTransform)(
            this.ngControl.value
        );

        if (!value) {
            this.dnsValidatorStore.clear();
            return;
        }

        if ((this.requiredValid && this.ngControl.valid) || !this.requiredValid) {
            this.dnsValidatorStore.queryDns({
                ...this.query,
                name: value,
            });
        } else {
            this.dnsValidatorStore.clear();
        }
    }
}
