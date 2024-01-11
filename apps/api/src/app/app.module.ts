import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
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
        }),
    ],
    controllers: [AppController],
    providers: [AppService, StoryGateway],
    exports: [BullModule],
})
export class AppModule {}
