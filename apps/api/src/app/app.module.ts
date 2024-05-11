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
        DistributedLockModule.forRoot({
            config: {
                lockPrefix: 'redis',
                client: {
                    host: 'localhost',
                    port: 6379,
                },
                fifo: true,
                retryOptions: {},
                lockTimeout: 10_000,
            },
            adapter: redisMutexLockAdapter,
        }),
    ],
    controllers: [AppController],
    providers: [AppService, StoryGateway],
})
export class AppModule {}
