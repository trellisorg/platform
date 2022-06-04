import { Inject, Injectable } from '@angular/core';
import {
    DynamicComponentRootConfig,
    DYNAMIC_COMPONENT_CONFIG,
} from './manifest';

@Injectable({ providedIn: 'root' })
export class Logger {
    constructor(
        @Inject(DYNAMIC_COMPONENT_CONFIG)
        private config: DynamicComponentRootConfig
    ) {}

    log(...s: string[]): void {
        if (this.config.devMode) console.log('[RxDynamicComponent]', ...s);
    }

    warn(...s: string[]): void {
        if (this.config.devMode) console.log('[RxDynamicComponent]', ...s);
    }

    error(...s: string[]): void {
        if (this.config.devMode) console.error('[RxDynamicComponent]', ...s);
    }
}
