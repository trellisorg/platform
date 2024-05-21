import { Injectable, Module, type NestMiddleware } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';
import { DistributedRateLimiterModule } from '@trellisorg/distributed-rate-limiter/nest';
import { axiosRetry429 } from '../../../../packages/distributed-rate-limiter/axios/src';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoryGateway } from './story.gateway';

@Injectable()
export class CookieAuthMiddleware implements NestMiddleware {
    use(req: any, res: any, next: (error?: any) => void): any {
        next();
    }
}

@Module({
    imports: [
        DistributedLockModule.register([
            {
                config: {
                    lockPrefix: 'redis',
                    client: {
                        host: 'localhost',
                        port: 6379,
                    },
                    retryOptions: {},
                    lockTimeout: 10_000,
                    fifo: true,
                },
                adapter: redisMutexLockAdapter,
                name: 'redis',
            },
        ]),
        DistributedLockModule.inherit([
            {
                config: {
                    lockPrefix: 'redis',
                    lockTimeout: 10_000,
                    fifo: true,
                },
                name: 'redis2',
                inheritFrom: 'redis',
            },
        ]),
        DistributedRateLimiterModule.forRoot([
            {
                config: {
                    retryFunctions: [
                        // Wait to retry for the amount of time defined in the retry-after response header of the error.
                        axiosRetry429({ retryAfter: (error) => error.response.headers['retry-after'] }),
                    ],
                },
                name: 'rateLimiter',
            },
        ]),
        DistributedRateLimiterModule.forFeature({
            config: {},
            name: 'rateLimiter2',
            inheritFrom: 'rateLimiter',
        }),
    ],
    controllers: [AppController],
    providers: [AppService, StoryGateway],
})
export class AppModule {}
