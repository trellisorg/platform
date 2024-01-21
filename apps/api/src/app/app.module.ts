import { BullModule } from '@nestjs/bull';
import { Injectable, Module, type NestMiddleware } from '@nestjs/common';
import { NestBullMonitorModule } from '@trellisorg/nest-bull-monitor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoryGateway } from './story.gateway';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'sample',
        }),
    ],
    exports: [BullModule],
})
class Queues {}

@Injectable()
export class CookieAuthMiddleware implements NestMiddleware {
    use(req: any, res: any, next: (error?: any) => void): any {
        next();
    }
}

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
        }),
        Queues,
        NestBullMonitorModule.forRoot({
            bullQueues: ['sample'],
            metrics: {
                redisPrefix: 'bull-monitor',
                collectInterval: {
                    minutes: 1,
                },
                maxMetrics: 100,
            },
            imports: [Queues],
            middlewareConsumers: [CookieAuthMiddleware],
        }),
    ],
    controllers: [AppController],
    providers: [AppService, StoryGateway],
    exports: [BullModule],
})
export class AppModule {}
