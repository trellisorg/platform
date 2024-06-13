# @trellisorg/distributed-lock

This library provides a simple way to implement distributed locks using Redis. It is designed to be easy to use and integrate with your existing Node.js applications.

## Installation

```bash
npm install @trellisorg/distributed-lock ioredis
```

## Setup

### Standalone TypeScript

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';
import Redis from 'ioredis';

const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
});

const redisMutex = new RedisMutex({
    client: redisClient,
    lockPrefix: 'my-app',
    lockTimeout: 10_000,
    fifo: false,
});

// Acquire a lock on the resource 'my-resource'
const lock = await redisMutex.lock('my-resource');

// Do some work that requires the lock
console.log('Working with the resource...');

// Release the lock
await lock.unlock();
```

### NestJS

```typescript
import { Module } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';

@Module({
    imports: [
        DistributedLockModule.register([
            {
                config: {
                    lockPrefix: 'my-app',
                    client: {
                        host: 'localhost',
                        port: 6379,
                    },
                    retryOptions: {},
                    lockTimeout: 10_000,
                    fifo: false,
                },
                adapter: redisMutexLockAdapter,
                name: 'redis',
            },
        ]),
    ],
})
export class AppModule {}
```

## Configuration Options

| Option         | Type           | Default                        | Description                                                                                                                         |
| -------------- | -------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `client`       | `RedisOptions` | -                              | The connection options for Redis. See the `ioredis` documentation for more information.                                             |
| `lockPrefix`   | `string`       | `@trellisorg/distributed-lock` | A prefix for the lock keys. This helps to avoid collisions with other applications using Redis.                                     |
| `lockTimeout`  | `number`       | `10_000`                       | The time it takes for a lock to expire after acquisition. This is in milliseconds.                                                  |
| `retryOptions` | `RetryOptions` | `{}`                           | Options for retrying lock acquisition. See the `promise-retry` documentation for more information.                                  |
| `fifo`         | `boolean`      | `false`                        | Whether to use FIFO ordering for lock acquisition. If `true`, locks will be acquired and released in the order they were requested. |

## Usage

### Standalone TypeScript

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';
import Redis from 'ioredis';

const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
});

const redisMutex = new RedisMutex({
    client: redisClient,
    lockPrefix: 'my-app',
    lockTimeout: 10_000,
    fifo: false,
});

// Acquire a lock on the resource 'my-resource'
const lock = await redisMutex.lock('my-resource');

// Do some work that requires the lock
console.log('Working with the resource...');

// Release the lock
await lock.unlock();
```

### NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { InjectLock } from '@trellisorg/distributed-lock/nest';

@Injectable()
export class MyService {
    constructor(@InjectLock('redis') private readonly redisLock: DistributedLock) {}

    async doSomething() {
        await this.redisLock.withLock('my-resource', async () => {
            // Do some work that requires the lock
            console.log('Working with the resource...');
        });
    }
}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
