import { Injectable } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { InjectLock } from '@trellisorg/distributed-lock/nest';

@Injectable()
export class AppService {
    constructor(
        @InjectLock('redis') private readonly redisLock: DistributedLock,
        @InjectLock('redis2') private readonly redis2Lock: DistributedLock,
        @InjectLock('advisory') private readonly postgresLock: DistributedLock,
    ) {}

    getData() {
        return this.redisLock.withLock('getData', async () => ({ message: 'Welcome to api!' }));
    }
}
