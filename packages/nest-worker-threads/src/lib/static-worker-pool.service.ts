import { Injectable } from '@nestjs/common';
import type { MainThreadConfig } from '@trellisorg/nest-worker-threads';
import { StaticPool } from 'node-worker-threads-pool';
import { firstValueFrom, from, Observable, timeout } from 'rxjs';

// Redeclared from internal node-worker-threads-pool
type ExecCommand = (param: any) => any;

@Injectable()
export class StaticWorkerPoolService<PoolFunc extends ExecCommand> {
    constructor(
        private readonly pool: StaticPool<PoolFunc>,
        private readonly config: MainThreadConfig
    ) {}

    /**
     * Exec the function against the worker.
     * @param param
     * @param options
     */
    exec(
        param: Parameters<PoolFunc>[0],
        options?: { timeout?: number; observable?: false }
    ): Promise<ReturnType<PoolFunc>> {
        const p: Promise<ReturnType<PoolFunc>> = this.pool.exec(param);

        const obs: Observable<ReturnType<PoolFunc>> = from(p);

        return firstValueFrom(
            obs.pipe(timeout(options?.timeout ?? this.config.timeout))
        );
    }
}
