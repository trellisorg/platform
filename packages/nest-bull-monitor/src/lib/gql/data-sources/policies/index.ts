import { BullMonitorError } from '../../../errors';
import type { Queue } from '../../../queue';
import { PoliciesErrorEnum } from './errors-enum';

export class PoliciesDataSource {
    constructor(private _queues: Map<string, Queue>) {}

    isQueueReadonly(id: string): boolean {
        return this._queues.get(id)?.readonly ?? false;
    }

    raiseIfQueueReadonly(id: string): void {
        if (this.isQueueReadonly(id)) {
            throw new BullMonitorError(PoliciesErrorEnum.READ_ONLY_QUEUE);
        }
    }
}
