import type { ModuleMetadata, Type } from '@nestjs/common';
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
    // eslint-disable-next-line @typescript-eslint/ban-types
    middlewareConsumers?: (Type | Function)[];
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

const LazyBullAdapter = (queue: BullQueue) => import('../bull-adapter').then((m) => new m.BullAdapter(queue));
const LazyBullMQAdapter = (queue: BullMQQueue) => import('../bullmq-adapter').then((m) => new m.BullMQAdapter(queue));

const LazyGetBullQueueToken = () => import('@nestjs/bull').then((m) => m.getQueueToken);
const LazyGetBullMQQueueToken = () => import('@nestjs/bullmq').then((m) => m.getQueueToken);

@Module({})
export class NestBullMonitorModule implements NestModule {
    static async forRoot(config: NestBullMonitorConfig): Promise<DynamicModule> {
        const { bullQueues, bullMQQueues, imports, ...rest } = config;

        return {
            module: NestBullMonitorModule,
            global: true,
            providers: [
                {
                    provide: BULL_QUEUES,
                    useFactory: (...queues: BullQueue[]) => Promise.all(queues.map((queue) => LazyBullAdapter(queue))),
                    inject: bullQueues?.map(await LazyGetBullQueueToken()) ?? [],
                },
                {
                    provide: BULL_MQ_QUEUES,
                    useFactory: (...queues: BullMQQueue[]) =>
                        Promise.all(queues.map((queue) => LazyBullMQAdapter(queue))),
                    inject: bullMQQueues?.map(await LazyGetBullMQQueueToken()) ?? [],
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

    constructor(
        private readonly nestBullMonitorService: NestBullMonitorService,
        @Inject(CONFIG) private readonly config: NestBullMonitorConfig
    ) {}

    async configure(consumer: MiddlewareConsumer): Promise<void> {
        await this.nestBullMonitorService.init();

        if (!this.nestBullMonitorService.router) {
            throw new Error(`Router was not instantiated correctly.`);
        }

        consumer
            .apply(...(this.config.middlewareConsumers ?? []), this.nestBullMonitorService.router)
            .forRoutes('/bull-monitor');
    }
}
