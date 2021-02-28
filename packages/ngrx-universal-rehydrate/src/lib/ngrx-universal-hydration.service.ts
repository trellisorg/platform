import { Inject, Injectable } from '@angular/core';
import {
    makeStateKey,
    StateKey,
    TransferState,
} from '@angular/platform-browser';
import {
    createTransferStateKey,
    NGRX_TRANSFER_HYDRATE_CONFIG,
    NgrxTransferHydrateConfig,
} from './shared';

@Injectable()
export class NgrxUniversalHydrationService {
    private readonly stateKey: StateKey<any>;

    constructor(
        private transferState: TransferState,
        @Inject(NGRX_TRANSFER_HYDRATE_CONFIG)
        private config: NgrxTransferHydrateConfig
    ) {
        this.stateKey = makeStateKey(createTransferStateKey(config));
    }

    set state(state: any) {
        this._state = state;
        this.persistState(state);
    }

    private _state: any;

    private persistState(data: any): void {
        this.transferState.set(this.stateKey, data);
    }

    readState(): any {
        return this.transferState.get(this.stateKey, {});
    }

    clear(): void {
        this.transferState.remove(this.stateKey);
    }
}
