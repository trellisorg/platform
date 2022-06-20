import { HttpClient, HttpParams } from '@angular/common/http';
import { Directive, HostListener, Injectable, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { debounceTime, Observable, switchMap } from 'rxjs';

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

interface DnsValidatorState {
    response?: DoHResponse;
    ngControl?: NgControl;
}

@Injectable()
class DnsValidatorStore extends ComponentStore<DnsValidatorState> {
    readonly response$ = this.select((state) => state.response);

    constructor(private readonly _httpClient: HttpClient) {
        super();
    }

    readonly queryDns = this.effect((query$: Observable<DoHQuery>) =>
        query$.pipe(
            debounceTime(250),
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
                },
                () => {
                    this.patchState({
                        response: undefined,
                    });
                }
            )
        )
    );
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

    readonly response$ = this.dnsValidatorStore.response$;

    constructor(
        private readonly ngControl: NgControl,
        private readonly dnsValidatorStore: DnsValidatorStore
    ) {
        this.dnsValidatorStore.setState({
            ngControl: this.ngControl,
        });
    }

    @HostListener('keyup')
    async validateDns(): Promise<void> {
        if (
            (this.requiredValid && this.ngControl.valid) ||
            !this.requiredValid
        ) {
            this.dnsValidatorStore.queryDns({
                ...this.query,
                name: this.ngControl.value,
            });
        }
    }
}
