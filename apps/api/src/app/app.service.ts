import { Injectable } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';

@Injectable()
export class AppService {
    constructor(private readonly lock: DistributedLock) {}

    getData() {
        return this.lock.withLock('getData', async () => ({ message: 'Welcome to api!' }));
    }
}
