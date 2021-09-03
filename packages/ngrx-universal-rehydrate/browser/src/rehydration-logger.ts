import { Inject, Injectable } from '@angular/core';
import { REHYDRATE_ROOT_CONFIG } from './tokens';
import type { RehydrationRootConfig } from './utils';

@Injectable()
export class RehydrationLogger {
    constructor(
        @Inject(REHYDRATE_ROOT_CONFIG) private config: RehydrationRootConfig
    ) {}

    log(msg: string): void {
        if (!this.config.disableWarnings) {
            console.warn(`NgRx Universal Rehydration: ${msg}`);
        }
    }
}
