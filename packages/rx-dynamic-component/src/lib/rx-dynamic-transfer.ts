import { InjectionToken } from '@angular/core';
import type { StateKey } from '@angular/platform-browser';
import { makeStateKey } from '@angular/platform-browser';

export const RX_DYNAMIC_TRANSFER_SERVICE = new InjectionToken<RxDynamicTransfer>(`rx-dynamic-transfer-service`);

export function manifestTransferKey(manifestId: string): StateKey<void> {
    return makeStateKey<void>(`rx-dynamic-transfer-manifest:${manifestId}`);
}

export interface RxDynamicTransfer {
    /**
     * Will mark this manifest as being needed for rendering the page when SSR serves the initial page to
     * the client. This is a no-op when running in the browser.
     * @param manifestId
     */
    markUsed(manifestId: string): void;

    /**
     * Will check to see if the manifest was used in the SSR of the application so that when processing preloads we can
     * immediately pull the manifests needed for rendering. This is a no-op when running in the server.
     * @param manifestId
     */
    wasUsed(manifestId: string): boolean;
}
