import type { Provider } from '@angular/core';
import { Injectable } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import type { RxDynamicTransfer } from '@trellisorg/rx-dynamic-component';
import { manifestTransferKey, RX_DYNAMIC_TRANSFER_SERVICE } from '@trellisorg/rx-dynamic-component';

@Injectable()
export class RxDynamicServerTransferService implements RxDynamicTransfer {
    constructor(private readonly _transferState: TransferState) {}

    /**
     * While running in the server environment if a component gets loaded to be rendered then we know it has been
     * used and should be available as soon as possible when the client goes to replay the rendering.
     * @param manifestId
     */
    markUsed(manifestId: string): void {
        const transferKey = manifestTransferKey(manifestId);
        if (!this._transferState.hasKey(transferKey)) {
            this._transferState.set(transferKey, void 0);
        }
    }

    /**
     * When running in the server this will always return false because it hasn't been needed in a previous environment
     * (since there is no previous environment)
     * @param manifestId
     */
    wasUsed(manifestId: string): boolean {
        return false;
    }
}

export function provideRxDynamicServerTransfer(): Provider[] {
    return [{ provide: RX_DYNAMIC_TRANSFER_SERVICE, useClass: RxDynamicServerTransferService }];
}
