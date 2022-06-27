export {
    bootstrapNestWorkerThread,
    WorkerThreadConfigModule,
} from './lib/bootstrap-nest-worker-thread';
export { InjectPool } from './lib/inject-pool';
export { NestWorkerThreadModule } from './lib/nest-worker-thread.module';
export { ThreadMessage } from './lib/thread-message';
export { getPoolToken, THREAD_ID, WORKER_DATA } from './lib/tokens';
export type { Message, NestWorkerThreadConfig, Pools } from './lib/types';
