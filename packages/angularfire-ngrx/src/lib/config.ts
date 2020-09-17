import { InjectionToken } from '@angular/core';

export interface AngularFireNgrxConfig {
    replay: boolean;
}

export const defaultConfig: AngularFireNgrxConfig = {
    replay: true,
};

export const AF_NGRX_CONFIG = new InjectionToken<AngularFireNgrxConfig>(
    'angularfire-ngrx-config'
);
