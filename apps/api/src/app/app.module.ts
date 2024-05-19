import { Injectable, Module, type NestMiddleware } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';
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
    ],
    controllers: [AppController],
    providers: [AppService, StoryGateway],
})
export class AppModule {}
