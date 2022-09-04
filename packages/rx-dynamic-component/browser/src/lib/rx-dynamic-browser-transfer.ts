import type { Provider } from '@angular/core';
import { Injectable } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import type { RxDynamicTransfer } from '@trellisorg/rx-dynamic-component';
import { manifestTransferKey, RX_DYNAMIC_TRANSFER_SERVICE } from '@trellisorg/rx-dynamic-component';

@Injectable()
export class RxDynamicBrowserTransferService implements RxDynamicTransfer {
    constructor(private readonly _transferState: TransferState) {}

    /**
     * We do not need to mark anything as used when running inside the browser since we will abide by the existing
     * configurations for preloading.
     * @param manifestId
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    markUsed(manifestId: string): void {
        // No-op when in the browser.
    }

    /**
     * Check to see if this manifest was used to render the page when in a server environment. This function will be
     * used to determine if a manifest should be preloaded with immediate priority regardless of the manifest
     * configurations themselves since we know we need this component to replay the page on the client.
     * @param manifestId
     */
    wasUsed(manifestId: string): boolean {
        return this._transferState.hasKey(manifestTransferKey(manifestId));
    }
}

export function provideRxDynamicBrowserTransfer(): Provider[] {
    return [{ provide: RX_DYNAMIC_TRANSFER_SERVICE, useClass: RxDynamicBrowserTransferService }];
}
