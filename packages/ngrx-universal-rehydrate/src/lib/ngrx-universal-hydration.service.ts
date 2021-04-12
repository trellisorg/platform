import { Inject, Injectable } from '@angular/core';
import {
    makeStateKey,
    StateKey,
    TransferState,
} from '@angular/platform-browser';
import {
    createTransferStateKey,
    NGRX_TRANSFER_HYDRATE_CONFIG,
    NgrxUniversalHydrateConfig,
} from './shared';
import { RuntimeChecks, USER_RUNTIME_CHECKS } from '@ngrx/store';

@Injectable()
export class NgrxUniversalHydrationService {
    private readonly stateKey: StateKey<any>;

    constructor(
        private transferState: TransferState,
        @Inject(NGRX_TRANSFER_HYDRATE_CONFIG)
        private config: NgrxUniversalHydrateConfig,
        @Inject(USER_RUNTIME_CHECKS)
        private runtimeChecks: Partial<RuntimeChecks>
    ) {
        if (
            !this.runtimeChecks?.strictStateSerializability &&
            !this.config.disableWarnings
        ) {
            console.warn(
                `NgRx Store is not configured to use 'strictStateSerializability',
                without this your stores may not be serializable.
                This could cause Universal to not serialize the TransferState correctly.`
            );
        }
        this.stateKey = makeStateKey(createTransferStateKey(config));
    }

    private _state: any;

    set state(state: any) {
        this._state = state;
        this.persistState(state);
    }

    readState(): any {
        return this.transferState.get(this.stateKey, {});
    }

    clear(): void {
        this.transferState.remove(this.stateKey);
    }

    private persistState(data: any): void {
        this.transferState.set(this.stateKey, data);
    }
}
