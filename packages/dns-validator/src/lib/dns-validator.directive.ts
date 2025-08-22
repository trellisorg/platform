import { HttpClient, HttpParams } from '@angular/common/http';
import {
    Directive,
    ElementRef,
    HostListener,
    Injectable,
    Renderer2,
    computed,
    inject,
    input,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ComponentStore, provideComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { debounceTime, switchMap, type Observable } from 'rxjs';
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
    response: DoHResponse | null;
}

@Injectable()
class DnsValidatorStore extends ComponentStore<DnsValidatorState> {
    private readonly config = inject(DNS_VALIDATOR_CONFIG, { optional: true });

    private readonly httpClient = inject(HttpClient);

    private readonly elementRef = inject(ElementRef);

    private readonly renderer2 = inject(Renderer2);

    readonly response = this.selectSignal((state) => state.response);

    readonly invalid = computed(() => {
        const response = this.response();

        return response && response.Status !== 0;
    });

    readonly clear = this.updater((state) => ({
        ...state,
        response: null,
    }));

    readonly queryDns = this.effect((query$: Observable<DoHQuery>) =>
        query$.pipe(
            debounceTime(this.config?.debounceTime ?? 250),
            switchMap((query) =>
                this.httpClient.get<DoHResponse>(`${googleDoH}`, {
                    params: {
                        ...query,
                    } as unknown as HttpParams,
                })
            ),
            tapResponse({
                error: () => {
                    this.patchState({
                        response: undefined,
                    });

                    this.processStatus(0);
                },
                next: (response) => {
                    this.patchState({
                        response,
                    });

                    this.processStatus(response.Status);
                },
            })
        )
    );

    constructor() {
        super({
            response: null,
        });
    }

    private processStatus(status: DoHResponse['Status']): void {
        if (status === 0) {
            this.renderer2.removeClass(this.elementRef.nativeElement, formClass);
        } else {
            this.renderer2.addClass(this.elementRef.nativeElement, formClass);
        }
    }
}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'input[dns]',
    providers: [provideComponentStore(DnsValidatorStore)],
    exportAs: 'dns',
    standalone: true,
})
export class DnsValidatorDirective {
    private readonly ngControl = inject(NgControl);

    private readonly dnsValidatorStore = inject(DnsValidatorStore);

    private readonly config = inject(DNS_VALIDATOR_CONFIG, {
        optional: true,
    });

    readonly query = input<Omit<DoHQuery, 'name'>>({});

    readonly requiredValid = input(true);

    readonly transformFn = input<(value: string) => string>();

    readonly response = this.dnsValidatorStore.response;

    readonly invalid = this.dnsValidatorStore.invalid;

    private defaultTransform(value: string | undefined | null): string | undefined {
        if (!value) {
            return undefined;
        }

        return value.split('@').pop();
    }

    @HostListener('keyup')
    async validateDns(): Promise<void> {
        const value = (this.transformFn() ?? this.config?.transformFn ?? this.defaultTransform)(
            this.ngControl.value
        );

        if (!value) {
            this.dnsValidatorStore.clear();
            return;
        }

        if ((this.requiredValid() && this.ngControl.valid) || !this.requiredValid()) {
            this.dnsValidatorStore.queryDns({
                ...this.query(),
                name: value,
            });
        } else {
            this.dnsValidatorStore.clear();
        }
    }
}
