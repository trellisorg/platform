import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { BEFORE_APP_SERIALIZED } from '@angular/platform-server';
import { Store } from '@ngrx/store';
import {
    REHYDRATE_TRANSFER_STATE,
    selectStateToTransfer,
} from '@trellisorg/ngrx-universal-rehydrate/browser';
import { take } from 'rxjs/operators';

/**
 *
 * @param store
 * @param transferState
 * @param existing The existing callback for serializing the TransferState
 */
export function serializeRehydrateStateFactory(
    store: Store,
    transferState: TransferState,
    existing: () => void
) {
    return async () => {
        const state = await store
            .select(selectStateToTransfer)
            .pipe(take(1))
            .toPromise();

        if (state) {
            transferState.set(REHYDRATE_TRANSFER_STATE, state);
        }

        await existing();
    };
}

@NgModule({})
export class NgrxUniversalRehydrateServerModule {
    constructor(
        @Optional()
        @Inject(BEFORE_APP_SERIALIZED)
        callbacks: (() => void | Promise<void>)[],
        _store: Store,
        _transferState: TransferState
    ) {
        /*
         * Register the callback that will store the saved slices into TransferState prior to render
         *
         * As it stands there is only one BEFORE_APP_SERIALIZED callback in the Angular framework.
         * This is the callback to serialize the transfer state (if it exists at all).
         *
         * We are assuming that the first callback is the aforementioned callback, this may break in the future
         * since we are wrapping that callback with our own callback to ensure that the transfer state for rehydration
         * is added to the TransferState before it is serialized
         */
        const serializeStateCallback = callbacks.find((c) => !!c);

        if (serializeStateCallback) {
            callbacks[0] = serializeRehydrateStateFactory(
                _store,
                _transferState,
                serializeStateCallback
            );
        }
    }

    static forServer(): ModuleWithProviders<NgrxUniversalRehydrateServerModule> {
        return {
            ngModule: NgrxUniversalRehydrateServerModule,
            providers: [],
        };
    }
}
