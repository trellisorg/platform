import { getQueueToken as getBullQueueToken } from '@nestjs/bull';
import { getQueueToken as getBullMQQueueToken } from '@nestjs/bullmq';
import type { ModuleMetadata } from '@nestjs/common';
import {
    Inject,
    Injectable,
    Module,
    type DynamicModule,
    type MiddlewareConsumer,
    type NestModule,
} from '@nestjs/common';
import type { Queue as BullQueue } from 'bull';
import type { Queue as BullMQQueue } from 'bullmq';
import { BullAdapter } from '../bull-adapter';
import { BullMQAdapter } from '../bullmq-adapter';
import { BullMonitorExpress } from '../express/bull-monitor-express';
import type { Queue } from '../queue';
import type { Config } from '../typings/config';

const BULL_QUEUES = Symbol('nest-bull-monitor:bull-queues');
const BULL_MQ_QUEUES = Symbol('nest-bull-monitor:bullmq-queues');
const CONFIG = Symbol('nest-bull-monitor:config');

export interface NestBullMonitorConfig extends Omit<Config, 'queues'> {
    bullQueues?: string[];
    bullMQQueues?: string[];
    imports: ModuleMetadata['imports'];
}

@Injectable()
class NestBullMonitorService extends BullMonitorExpress {
    constructor(
        @Inject(BULL_QUEUES) readonly bullQueues: Queue[],
        @Inject(BULL_MQ_QUEUES) readonly bullMQQueues: Queue[],
        @Inject(CONFIG) readonly nestBullMonitorConfig: Omit<NestBullMonitorConfig, 'bullQueues'>
    ) {
        super({
            queues: [...bullQueues, ...bullMQQueues],
            ...nestBullMonitorConfig,
        });
    }
}

@Module({})
export class NestBullMonitorModule implements NestModule {
    static forRoot(config: NestBullMonitorConfig): DynamicModule {
        const { bullQueues, bullMQQueues, imports, ...rest } = config;

        return {
            module: NestBullMonitorModule,
            global: true,
            providers: [
                {
                    provide: BULL_QUEUES,
                    useFactory: (...queues: BullQueue[]) => queues.map((queue) => new BullAdapter(queue)),
                    inject: bullQueues?.map(getBullQueueToken) ?? [],
                },
                {
                    provide: BULL_MQ_QUEUES,
                    useFactory: (...queues: BullMQQueue[]) => queues.map((queue) => new BullMQAdapter(queue)),
                    inject: bullMQQueues?.map(getBullMQQueueToken) ?? [],
                },
                {
                    provide: CONFIG,
                    useValue: rest,
                },
                NestBullMonitorService,
            ],
            exports: [BULL_QUEUES, CONFIG, BULL_MQ_QUEUES],
            imports,
        };
    }

    constructor(private readonly nestBullMonitorService: NestBullMonitorService) {}

    async configure(consumer: MiddlewareConsumer): Promise<void> {
        await this.nestBullMonitorService.init();

        if (!this.nestBullMonitorService.router) {
            throw new Error(`Router was not instantiated correctly.`);
        }

        consumer.apply(this.nestBullMonitorService.router).forRoutes('/bull-monitor');
    }
}
