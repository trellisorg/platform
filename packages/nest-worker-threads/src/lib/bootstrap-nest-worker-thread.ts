import {
    Global,
    INestApplicationContext,
    Module,
    ModuleMetadata,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { parentPort, threadId, workerData } from 'worker_threads';
import { THREAD_ID, WORKER_DATA } from './tokens';

/**
 * @description configuration module that will provide the injection tokens for
 * [threadId]{@link https://nodejs.org/api/worker_threads.html#workerthreadid}
 * [workerData]{@link https://nodejs.org/api/worker_threads.html#workerworkerdata}
 */
@Global()
@Module({
    providers: [
        {
            provide: WORKER_DATA,
            useValue: workerData ?? null,
        },
        {
            provide: THREAD_ID,
            useValue: threadId,
        },
    ],
    exports: [WORKER_DATA, THREAD_ID],
})
export class WorkerThreadConfigModule {}

/**
 * @description bootstraps a [Standalone Nest app]{@link https://docs.nestjs.com/standalone-applications} inside of a
 * Node Worker Thread and returns the {@link INestApplicationContext}
 * @param metadata
 * @param options
 * @return INestApplicationContext
 */
export async function bootstrapNestWorkerThread(
    metadata: ModuleMetadata,
    options?: Parameters<typeof NestFactory['createApplicationContext']>[1]
): Promise<INestApplicationContext> {
    if (!parentPort) {
        throw new Error(`Not currently in a Node Worker Thread.`);
    }

    @Module({
        ...metadata,
        imports: [WorkerThreadConfigModule, ...(metadata.imports ?? [])],
    })
    class AppModule {}

    const app = await NestFactory.createApplicationContext(AppModule, options);

    parentPort.on('close', () => app?.close());

    return app;
}
