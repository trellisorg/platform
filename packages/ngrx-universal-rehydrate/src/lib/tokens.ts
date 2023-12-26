import { InjectionToken, makeStateKey } from '@angular/core';

import type { RehydrationRootConfig } from './utils';

export const REHYDRATE_ROOT_CONFIG = new InjectionToken<RehydrationRootConfig>('ngrxUniversalHydrateRootConfig');

export const REHYDRATE_TRANSFER_STATE = makeStateKey<Set<string>>('ngrxUniversalStatesTransferred');

export const FEATURE_STORES = new InjectionToken<string[]>('ngrxUniversalHydrateFeatureState');
