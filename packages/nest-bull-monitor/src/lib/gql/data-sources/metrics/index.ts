import { BullMonitorError } from '../../../errors';
import type { MetricsCollector } from '../../../metrics-collector';
import { MetricsErrorEnum as ErrorEnum } from './errors-enum';

export class MetricsDataSource {
    constructor(private _internalCollector?: MetricsCollector) {}

    async getMetrics(queue: string, start?: number, end?: number) {
        return await this._collector.extract(queue, start, end);
    }

    async clearAllMetrics() {
        await this._collector.clearAll();
        return true;
    }

    async clearMetrics(queue: string) {
        await this._collector.clear(queue);
        return true;
    }

    private _throwInternalError(e: ErrorEnum) {
        throw new BullMonitorError(e);
    }
    private _throwNoCollector() {
        this._throwInternalError(ErrorEnum.NO_COLLECTOR);
    }
    private get _collector() {
        if (!this._internalCollector) {
            this._throwNoCollector();
        }
        return this._internalCollector as NonNullable<MetricsCollector>;
    }
}
