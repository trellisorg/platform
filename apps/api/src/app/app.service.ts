import { Injectable } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { InjectLock } from '@trellisorg/distributed-lock/nest';
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';
import { InjectRateLimiter } from '@trellisorg/distributed-rate-limiter/nest';

@Injectable()
export class AppService {
    constructor(
        @InjectLock('redis') private readonly redisLock: DistributedLock,
        @InjectLock('redis2') private readonly redis2Lock: DistributedLock,
        @InjectRateLimiter('rateLimiter') private readonly rateLimiter: DistributedRateLimiter,
        @InjectRateLimiter('rateLimiter2') private readonly rateLimiter2: DistributedRateLimiter
    ) {}

    getData() {
        return this.redisLock.withLock('getData', async () => ({ message: 'Welcome to api!' }));
    }
}
