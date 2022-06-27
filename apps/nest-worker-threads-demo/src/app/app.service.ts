import { Injectable } from '@nestjs/common';
import { InjectPool } from '@trellisorg/nest-worker-threads';
import { StaticPool } from 'node-worker-threads-pool';

type ExecCommand = ({ message }: { message: string }) => { message: string };

@Injectable()
export class AppService {
    constructor(
        @InjectPool('hello')
        private readonly pool: StaticPool<ExecCommand>
    ) {}

    getResultFromWorker(): Promise<{ message: string }> {
        return this.pool.exec({
            message: 'Hello World',
        });
    }
}
