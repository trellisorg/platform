import { Injectable } from '@nestjs/common';
import {
    bootstrapNestWorkerThread,
    Message,
    ThreadMessage,
    THREAD_ID,
    WORKER_DATA,
} from '@trellisorg/nest-worker-threads';

@Injectable()
class Worker {
    @ThreadMessage()
    getDate(message: Message<{ message: string }>): { message: string } {
        return { message: message.data.message };
    }
}

bootstrapNestWorkerThread({
    providers: [Worker],
}).then((app) => {
    const threadId = app.get(THREAD_ID);
    const workerData = app.get(WORKER_DATA);
});
