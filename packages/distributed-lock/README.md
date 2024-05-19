# Distributed Lock - Redis Mutex

This package provides a simple, flexible and robust implementation of a distributed lock using Redis as the backing store. It allows multiple processes or nodes to coordinate access to shared resources.

## Installation

```bash
npm install @trellisorg/distributed-lock ioredis
OR
bun install @trellisorg/distributed-lock ioredis
OR
yarn add @trellisorg/distributed-lock ioredis
OR
pnpm i @trellisorg/distributed-lock ioredis
```

## Setup

### Redis

Make sure you have Redis installed and running. You can find installation instructions for your system on the [Redis website](https://redis.io/docs/getting-started/installation/).

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
                    lockPrefix: 'redis',
                    client: {
                        host: 'localhost',
                        port: 6379,
                    },
                    retryOptions: {},
                    lockTimeout: 10_000,
                    fifo: true,
                },
                adapter: redisMutexLockAdapter,
                name: 'redis',
            },
        ]),
    ],
    // ...
})
export class AppModule {}
```

### Standalone

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';

const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    fifo: true,
});
```

## Options

The following options can be passed to the `RedisMutex` constructor:

| Option                        | Type         | Description                                                                                                                                                       | Default Value                  |
| ----------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `client`                      | RedisOptions | The connection options for Redis, these will be passed into `ioredis` if a string or redis options or will just use the Redis instance otherwise.                 | N/A                            |
| `lockPrefix`                  | string       | A prefix for the lock keys (default: `@trellisorg/distributed-lock`).                                                                                             | `@trellisorg/distributed-lock` |
| `lockTimeout`                 | number       | The time it takes for a lock to expire after acquisition (default: 10 seconds).                                                                                   | 10000                          |
| `retryOptions`                | RetryOptions | Options for retrying lock acquisition (see promise-retry documentation).                                                                                          | `{}`                           |
| `automaticExtensionThreshold` | number       | The threshold before a lock will be automatically extended, this should be large enough that the lock does not expire while it is being attempted to be extended. | 500                            |
| `fifo`                        | boolean      | Whether to use FIFO ordering for lock acquisition (default: false).                                                                                               | false                          |

## Configuration Values

-   `client`: The Redis client configuration. Refer to the `ioredis` documentation for available options.
-   `lockPrefix`: A string used as a prefix for lock keys, helping to organize locks and prevent collisions.
-   `lockTimeout`: The duration in milliseconds for which a lock is held before automatically expiring.
-   `retryOptions`: An object containing retry options for lock acquisition. This can be used to specify retry attempts, delay between attempts, and backoff strategies.
-   `fifo`: A boolean flag indicating whether lock acquisition should follow FIFO (First-In, First-Out) order.

## Usage

### Acquiring a Lock

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';

const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    fifo: true,
});

const resource = 'my-resource';

// Acquire the lock
const { unlock } = await lock.lock(resource);

// Perform critical operations
console.log('Lock acquired for resource:', resource);

// Release the lock when done
await unlock();
```

### Using withLock

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';

const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    fifo: true,
});

const resource = 'my-resource';

// Acquire the lock and execute the function
await lock.withLock(resource, async () => {
    console.log('Lock acquired for resource:', resource);

    // Perform critical operations
    // ...
});
```

### Checking Lock Availability

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';

const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    fifo: true,
});

const resource = 'my-resource';

try {
    await lock.checkLock(resource);
    console.log('Lock is available!');
} catch (error) {
    console.error('Lock is not available:', error);
}
```

### Extending a Lock

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';

const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    fifo: true,
});

const resource = 'my-resource';

// Acquire the lock
const { unlock, extend } = await lock.lock(resource);

// ... perform operations that require the lock ...

// Extend the lock's expiration
await extend();
```

### Error Handling

The `RedisMutex` class throws errors in certain scenarios:

-   **Lock Acquisition Error:** If a lock cannot be acquired due to contention or other errors, a `LockError` will be thrown. You can handle these errors by using `try...catch` blocks.
-   **Lock Extension Error:** If a lock cannot be extended due to contention or other errors, a `LockError` will be thrown. You can handle these errors by using `try...catch` blocks.

## NestJS Integration

### Installation

```bash
npm install @trellisorg/distributed-lock/nest
```

### Usage

```typescript
import { Module } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';

@Module({
    imports: [
        DistributedLockModule.register([
            {
                config: {
                    lockPrefix: 'redis',
                    client: {
                        host: 'localhost',
                        port: 6379,
                    },
                    retryOptions: {},
                    lockTimeout: 10_000,
                    fifo: true,
                },
                adapter: redisMutexLockAdapter,
                name: 'redis',
            },
        ]),
    ],
    // ...
})
export class AppModule {}
```

### Injecting the Lock

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { InjectLock } from '@trellisorg/distributed-lock/nest';

@Injectable()
export class MyService {
    constructor(@InjectLock('redis') private readonly redisLock: DistributedLock) {}

    async myMethod() {
        await this.redisLock.withLock('my-resource', async () => {
            // Perform critical operations
        });
    }
}
```

### Inheriting from an existing lock:

You can use the `inherit` method to create a new lock configuration that inherits from an existing lock configuration. This can be useful for sharing lock configurations across multiple modules, or for creating child locks with specific configurations:

```typescript
import { Module } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';

@Module({
    imports: [
        DistributedLockModule.register([
            {
                config: {
                    lockPrefix: 'redis',
                    client: {
                        host: 'localhost',
                        port: 6379,
                    },
                    retryOptions: {},
                    lockTimeout: 10_000,
                    fifo: true,
                },
                adapter: redisMutexLockAdapter,
                name: 'redis',
            },
        ]),
        DistributedLockModule.inherit([
            {
                config: {
                    // ... specific configuration for this lock
                },
                name: 'redis2',
                inheritFrom: 'redis',
            },
        ]),
    ],
    // ...
})
export class AppModule {}
```

### Registering Locks Asynchronously

You can register locks asynchronously by using the `registerAsync` method. This allows you to configure locks dynamically based on environment variables or other factors:

```typescript
import { Module } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';

@Module({
    imports: [
        DistributedLockModule.registerAsync([
            {
                name: 'redis',
                useFactory: async () => {
                    return {
                        config: {
                            lockPrefix: 'redis',
                            client: {
                                host: 'localhost',
                                port: 6379,
                            },
                            retryOptions: {},
                            lockTimeout: 10_000,
                            fifo: true,
                        },
                        adapter: redisMutexLockAdapter,
                    };
                },
            },
        ]),
    ],
    // ...
})
export class AppModule {}
```

### Asynchronous Example with Multiple Locks:

```typescript
import { Module } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';

@Module({
    imports: [
        DistributedLockModule.registerAsync([
            {
                name: 'redis',
                useFactory: async () => {
                    return {
                        config: {
                            lockPrefix: 'redis',
                            client: {
                                host: 'localhost',
                                port: 6379,
                            },
                            retryOptions: {},
                            lockTimeout: 10_000,
                            fifo: true,
                        },
                        adapter: redisMutexLockAdapter,
                    };
                },
            },
            {
                name: 'redis2',
                useFactory: async () => {
                    return {
                        config: {
                            lockPrefix: 'redis2',
                            client: {
                                host: 'localhost',
                                port: 6379,
                            },
                            retryOptions: {},
                            lockTimeout: 10_000,
                            fifo: false,
                        },
                        adapter: redisMutexLockAdapter,
                    };
                },
            },
        ]),
    ],
    // ...
})
export class AppModule {}
```

### Using InjectLock

The `InjectLock` decorator is used to inject an instance of the `DistributedLock` class into a provider or controller. You need to pass the name of the lock configuration that you want to inject:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { InjectLock } from '@trellisorg/distributed-lock/nest';

@Injectable()
export class MyService {
    constructor(@InjectLock('redis') private readonly redisLock: DistributedLock) {}

    async myMethod() {
        await this.redisLock.withLock('my-resource', async () => {
            // Perform critical operations
        });
    }
}
```

## Advanced Usage

### FIFO (First-In, First-Out) Ordering

You can use the `fifo` option to enable FIFO ordering for lock acquisition. This ensures that locks are acquired and released in the order they were requested.

```typescript
const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    fifo: true,
});
```

### Multi-Resource Locking

You can acquire locks on multiple resources simultaneously by passing an array of resource names to the `lock` method:

```typescript
const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    fifo: true,
});

const resources = ['resource1', 'resource2', 'resource3'];

// Acquire locks on all resources
const { unlock } = await lock.lock(resources);
```

### Custom Retry Options

You can customize the retry options using the `retryOptions` option. Refer to the `promise-retry` documentation for available options:

```typescript
const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 10_000,
    retryOptions: {
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        randomize: true,
    },
});
```

### Custom Lock Timeout

You can set a custom lock timeout using the `lockTimeout` option:

```typescript
const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'redis',
    lockTimeout: 5000, // 5 seconds
});
```

### Custom Lock Prefix

You can set a custom lock prefix using the `lockPrefix` option:

```typescript
const lock = new RedisMutex({
    client: {
        host: 'localhost',
        port: 6379,
    },
    lockPrefix: 'my-app-locks',
    lockTimeout: 10_000,
});
```

## Examples

### Simple Example

```typescript
import { RedisMutex } from '@trellisorg/distributed-lock/redis-mutex';

async function main() {
    const lock = new RedisMutex({
        client: {
            host: 'localhost',
            port: 6379,
        },
        lockPrefix: 'redis',
        lockTimeout: 10_000,
        fifo: true,
    });

    const resource = 'my-resource';

    try {
        const { unlock } = await lock.lock(resource);

        console.log('Lock acquired for resource:', resource);

        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 2000));

        await unlock();
        console.log('Lock released for resource:', resource);
    } catch (error) {
        console.error('Error acquiring lock:', error);
    }
}

main();
```

### NestJS Example

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { InjectLock } from '@trellisorg/distributed-lock/nest';

@Injectable()
export class MyService {
    constructor(@InjectLock('redis') private readonly redisLock: DistributedLock) {}

    async myMethod() {
        await this.redisLock.withLock('my-resource', async () => {
            console.log('Lock acquired for resource: my-resource');

            // Perform critical operations
            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log('Lock released for resource: my-resource');
        });
    }
}
```

## License

MIT
