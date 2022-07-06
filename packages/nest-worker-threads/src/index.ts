export {
    bootstrapNestWorkerThread,
    WorkerThreadConfigModule,
} from './lib/bootstrap-nest-worker-thread';
export { InjectPool, InjectPoolService } from './lib/inject-pool';
export { NestWorkerThreadModule } from './lib/nest-worker-thread.module';
export { StaticWorkerPoolService } from './lib/static-worker-pool.service';
export { ThreadMessage } from './lib/thread-message';
export {
    getPoolServiceToken,
    getPoolToken,
    MAIN_THREAD_CONFIG,
    THREAD_ID,
    WORKER_DATA,
} from './lib/tokens';
export type {
    MainThreadConfig,
    Message,
    NestWorkerThreadConfig,
    Pools,
} from './lib/types';
