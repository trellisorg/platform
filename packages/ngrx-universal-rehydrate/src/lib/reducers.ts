import { isPlatformBrowser } from '@angular/common';
import type { TransferState } from '@angular/platform-browser';
import { INIT, MetaReducer } from '@ngrx/store';
import { REHYDRATE_TRANSFER_STATE } from './tokens';
import type { RehydrationRootConfig } from './utils';
import { mergeStates } from './utils';

export function browserRehydrateReducer(
    // eslint-disable-next-line @typescript-eslint/ban-types
    platformId: Object,
    _transferStateService: TransferState,
    config: RehydrationRootConfig
): MetaReducer<unknown> {
    const isBrowser = isPlatformBrowser(platformId);

    if (isBrowser) {
        /**
         * This will grab from the transferred state all of the state keys created by this library for the root
         * and any features that were added
         */
        const statesTransferred = _transferStateService.get(
            REHYDRATE_TRANSFER_STATE,
            undefined
        );

        /**
         * Only return a reducer that will attempt to rehydrate the state if there were states transferred to begin with
         */
        if (statesTransferred) {
            return (reducer) => (state, action) => {
                if (action.type === INIT) {
                    const merged =
                        mergeStates(
                            state,
                            statesTransferred,
                            config.mergeStrategy
                        ) || {};

                    return reducer(merged, action);
                }

                return reducer(state, action);
            };
        }
    }

    /**
     * If the app is not in the browser or if there were no transferred states then return a meta reducer
     * that does not don anything to the state
     */
    return (reducer) => (state, action) => reducer(state, action);
}
