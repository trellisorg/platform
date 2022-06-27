# @trellisorg/nest-worker-threads

## Why

JavaScript is a single threaded language which means when running concurrent tasks you get less throughput than
languages that can run operations in parallel using built in methods. Node.js has what is called
the [Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/) which helps with this.

In a simple sense this means that although many tasks can be running concurrently (think Express server processing many
requests). Only one operation is ever running at once (Note: This is true for most cases but not all, read more about
blocking/non-blocking) operations [here](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/) about the
internal Worker Pool.

Scaling your Node.js servers horizontally is all well and good but because of the single-threaded nature of JavaScript
it makes it very difficult to leverage multicore CPUs and larger instances classes for your VMs which means it is harder
to leverage vertical scaling and optimize the throughput of your servers to ensure you are being efficient about the
resources that are provisioned in your environment.

Since Node.js 10.5, Node has had support for [_Worker Threads_](https://nodejs.org/api/worker_threads.html). Worker
Threads are a way to spin up another Node process that will execute JavaScript, this new process has its own Event Loop
and environment and thus can process JavaScript in parallel (multiple operations at once across main process and all
worker threads) which increases the throughput of our Node server/script and better leverages multicore CPUs.

By using Worker Threads in our servers we can offload some work that needs to be done to another thread so that our main
thread is not blocked and has more room in its Event Loop to process operations.

This library is built to be used with [Nest](https://docs.nestjs.com/) and
leverages [node-worker-threads-pool](https://www.npmjs.com/package/node-worker-threads-pool) internally to manage a pool
of workers all designed to process predefined behaviour in parallel to the main thread. It exposes an easy Promise based
API so that you can `await` the calls to your Worker Threads. It will automatically manage the available workers or wait
until one is available. This means tha you can now use Worker Threads directly from Nest AND
run [Nest Standalone Apps](https://docs.nestjs.com/standalone-applications) from within a Worker Thread so that you are
writing and building code the same between your main application and all additional threads. Standalone apps do not have
an underlying HTTP server or any other network listeners (by default). This makes it very easy and light to start up and
perfect for our use case.

## Installation

### npm

`npm i --save @trellisorg/nest-worker-threads node-worker-threads-pool`

### yarn

`yarn add @trellisorg/nest-worker-threads node-worker-threads-pool`

## How

### Step 1: Create Worker Thread code

Configure an [additional entry point](https://nx.dev/packages/node/executors/webpack#additionalentrypoints) in your
Webpack config, in Nx, this would be in your projects `build` target
options. (Additional configuration properties left out for brevity)

`project.json`

```json
{
    "targets": {
        "build": {
            "options": {
                "additionalEntryPoints": [
                    {
                        "entryName": "worker",
                        "entryPath": "apps/api/src/workers/worker.ts"
                    }
                ]
            }
        }
    }
}
```

Where `entryPath` is the path to the entry TypeScript file for your Worker Thread code.

`worker.ts`

```typescript
import { Injectable } from '@nestjs/common';
import {
    bootstrapNestWorkerThread,
    Message,
    THREAD_ID,
    ThreadMessage,
    WORKER_DATA,
} from '@trellisorg/nest-worker-threads';

/*
You can access threadId and workerData here before you bootstrap your application as you normally would in a Worker Thread
in case your application bootstrapping process depends on the data passed in when the Worker Thread is started up 
(created and added to the pool in the main thread)
 */

/*
A service to start up within the bootstrapped standalone application. This will listen for messages on the message bus and process them.
 */
@Injectable()
class Worker {
    /*
  Decorator to tell Nest what method should be used to process incoming messages. More on this below.
   */
    @ThreadMessage()
    getDate(message: Message<{ value: string }>): { value: string } {
        return { value: message.data.value };
    }
}

/*
Typically this would be in a main.ts file for your Nest server. 
This is doing almost the exact same thing, except that instead of directly calling the Nest 
factory to create the application a convenience methid is exposed to automatically setup some 
injection tokens for the `threadId` and `workerData`.
 */
bootstrapNestWorkerThread({
    providers: [Worker],
}).then((app) => {
    // threadId and workerData are available here and throughout the rest of your application as injection tokens.
    const threadId = app.get(THREAD_ID);
    const workerData = app.get(WORKER_DATA);
});
```

### Step 2: Add `@trellisorg/nest-worker-threads` to your application and configure the worker

`app.module.ts` (Will be created for you if you used the Nx generator, alongside the `AppController` and `AppService`)

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { NestWorkerThreadModule } from '@trellisorg/nest-worker-threads';

@Module({
    imports: [
        NestWorkerThreadModule.forRoot({
            pools: [
                {
                    // Will provide a StaticPool of Worker Threads that can be injected using the @InjectPool('hello') decorator.
                    id: 'hello',
                    /*
                    Because we configured the additional entry points for the `worker.ts` file.
                     When we build the app there will be a `worker.js` file that exists in our 
                     dist folder with our Worker Thread bootstrap code in it.
                     
                     Instantiated the StaticPool with a size of 2.
                     
                     `options` takes the same options as the `StaticPool` constructor from `node-worker-threads-pool`
                     */
                    options: { task: join(__dirname, 'worker.js'), size: 2 },
                },
            ],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
```

### Step 3: Inject the pool and send a command to it

`app.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { StaticPool } from 'node-worker-threads-pool';
import { InjectPool } from '@trellisorg/nest-worker-threads';

/*
The type defining what the `exec` command is expecting to return. This will strongly type your `pool.exec` commands.

You should create a shared type so that the code in your main thread is expecting the same request/response types as the service processing
the message in your Worker Thread.
 */
type ExecCommand = (value: string) => { value: string };

@Injectable()
export class AppService {
    // Injects the pool to be used from within the service.
    constructor(
        @InjectPool('hello')
        private readonly pool: StaticPool<ExecCommand>
    ) {}

    /*
    It now becomes a simple promise call. { value: 'Hello World' } will be sent to the worker thread and the worker thread will send it back.
     */
    getResultFromWorker() {
        return this.pool.exec({
            value: 'Hello World',
        });
    }
}
```

Now if you hit the endpoint in the controller (if generated with Nx: `curl http://localhost:3333/api`) you will see `{ value: 'Hello World' }` logged.
