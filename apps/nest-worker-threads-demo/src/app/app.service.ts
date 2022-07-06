import { Injectable } from '@nestjs/common';
import {
    InjectPool,
    InjectPoolService,
    StaticWorkerPoolService,
} from '@trellisorg/nest-worker-threads';
import { StaticPool } from 'node-worker-threads-pool';

type ExecCommand = ({ message }: { message: string }) => { message: string };

@Injectable()
export class AppService {
    constructor(
        @InjectPool('hello')
        private readonly pool: StaticPool<ExecCommand>,
        @InjectPoolService('hello')
        private readonly poolService: StaticWorkerPoolService<ExecCommand>
    ) {}

    getResultFromWorker(): Promise<{ message: string }> {
        return this.pool.exec({
            message: 'Hello World',
        });
    }

    getResultFromWorkerWithTimeout(): Promise<{ message: string }> {
        return this.poolService.exec({
            message: 'Hello World',
        });
    }
}
