import { Inject, Injectable, NgZone } from '@angular/core';
import { Logger } from './logger';
import {
    DEFAULT_TIMEOUT,
    DynamicComponentManifest,
    DynamicComponentRootConfig,
    DYNAMIC_COMPONENT_CONFIG,
} from './manifest';

/*
 * TODO: Remove IdleDeadline and requestIdleCallback typing once upgrade to 4.4
 * https://github.com/microsoft/TypeScript/issues/40807
 */
interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining: () => number;
}

declare global {
    interface Window {
        requestIdleCallback: (
            callback: (idleDeadline: IdleDeadline) => unknown,
            options?: { timeout?: number }
        ) => void;
    }
}

@Injectable()
export class RxDynamicComponentPreloaderService {
    constructor(
        @Inject(DYNAMIC_COMPONENT_CONFIG)
        private config: DynamicComponentRootConfig,
        private _ngZone: NgZone,
        private logger: Logger
    ) {}

    async processManifestPreloads(
        manifests: DynamicComponentManifest[]
    ): Promise<void> {
        for (const manifest of manifests) {
            if (manifest.preload || (manifest.preload && this.config.preload)) {
                // Will default to a timeout of 1 second
                const timeout =
                    (manifest.timeout ??
                        (this.config.preload && this.config.timeout)) ||
                    DEFAULT_TIMEOUT;

                if (NgZone.isInAngularZone()) {
                    this.logger.log(
                        `Is in NgZone, loading ${manifest.componentId} outside of zone.`
                    );
                    await this._ngZone.runOutsideAngular(
                        async () =>
                            await this.idleLoadIfPossible(manifest, timeout)
                    );
                } else {
                    await this.idleLoadIfPossible(manifest, timeout);
                }
            }
        }
    }

    async idleLoadIfPossible(
        manifest: DynamicComponentManifest,
        timeout: number
    ): Promise<void> {
        if ('requestIdleCallback' in window) {
            this.logger.log(
                `requestIdleCallback is available, scheduling load for "${manifest.componentId}" with a timeout of ${timeout}ms`
            );
            window.requestIdleCallback(
                async (idleDeadline) => {
                    const timeRemaining = idleDeadline.timeRemaining();
                    if (idleDeadline.didTimeout || timeRemaining > 0) {
                        this.logger.log(
                            `IdleDeadline for ${manifest.componentId} emitted. didTimeout: ${idleDeadline.didTimeout}, timeRemaining: ${timeRemaining}`
                        );
                        await this.loadManifest(manifest);
                    }
                },
                {
                    timeout,
                }
            );
        } else {
            this.logger.log(
                `requestIdleCallback is not available, loading ${manifest.componentId} immediately`
            );
            await this.loadManifest(manifest);
        }
    }

    async loadManifest(manifest: DynamicComponentManifest): Promise<void> {
        this.logger.log(`Loading ${manifest.componentId}`);

        await manifest.loadChildren();

        return;
    }
}
