import { Inject, Injectable, NgZone } from '@angular/core';
import type { Observable } from 'rxjs';
import { isObservable } from 'rxjs';
import { Logger } from './logger';
import {
    DEFAULT_TIMEOUT,
    DynamicComponentManifest,
    DynamicComponentRootConfig,
    DynamicManifestPreloadPriority,
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

function isPromiseOrObservable<T>(
    promiseOrObservable: Promise<T> | Observable<T> | any
): boolean {
    return (
        !!(promiseOrObservable as Promise<T>)?.then ||
        isObservable<T>(promiseOrObservable)
    );
}

@Injectable()
export class RxDynamicComponentPreloaderService {
    private readonly preloaded: Set<string> = new Set<string>();

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
            /*
             * Should preload the manifest if explicitly set or inherited from the global config.
             *
             * Will only preload manifests that are promises or observables, ie. are dynamically imported, for
             * the cases where `loadChildren: () => Module` there is not need to preload since that Module is
             * included in the bundle already
             *
             * In the case where RxDynamicComponentModule.forFeature() is used in multiple places with the same componentId
             * or the module importing it is used multiple times this service will mark the componentId as preloaded already
             * so it will not try and load it again.
             */
            if (
                (manifest.preload ||
                    (manifest.preload !== false && this.config.preload)) &&
                isPromiseOrObservable(manifest.loadChildren()) &&
                !this.preloaded.has(manifest.componentId)
            ) {
                this.preloaded.add(manifest.componentId);

                // Will default to a timeout of 1 second
                const timeout =
                    manifest.timeout ?? this.config.timeout ?? DEFAULT_TIMEOUT;

                // If not specified the priority will always be IDLE
                const priority: DynamicManifestPreloadPriority =
                    manifest.priority ??
                    this.config.priority ??
                    DynamicManifestPreloadPriority.IDLE;

                if (NgZone.isInAngularZone()) {
                    this.logger.log(
                        `Is in NgZone, loading ${manifest.componentId} outside of zone.`
                    );
                    await this._ngZone.runOutsideAngular(
                        async () =>
                            await this.loadWithPriority(
                                manifest,
                                timeout,
                                priority
                            )
                    );
                } else {
                    await this.loadWithPriority(manifest, timeout, priority);
                }
            }
        }
    }

    async loadWithPriority(
        manifest: DynamicComponentManifest,
        timeout: number,
        priority: DynamicManifestPreloadPriority
    ): Promise<void> {
        if (
            'requestIdleCallback' in window &&
            priority === DynamicManifestPreloadPriority.IDLE
        ) {
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
            if (priority === DynamicManifestPreloadPriority.IDLE)
                this.logger.log(
                    `requestIdleCallback is not available, loading ${manifest.componentId} immediately`
                );
            await this.loadManifest(manifest);
        }
    }

    async loadManifest(manifest: DynamicComponentManifest): Promise<void> {
        this.logger.log(`Loading ${manifest.componentId}`);

        const promiseOrObservable = manifest.loadChildren();

        await (isObservable(promiseOrObservable)
            ? promiseOrObservable.toPromise()
            : promiseOrObservable);

        return;
    }
}
