# @trellisorg/distributed-lock

Distributed locking for NestJS and plain TypeScript applications.

## Installation

```bash
npm install @trellisorg/distributed-lock
```

## Usage

### Plain TypeScript

```typescript
import { redisMutexLockAdapter } from '@trellisorg/distributed-lock/redis-mutex';

const mutex = redisMutexLockAdapter({
    client: {
        host: 'localhost',
        port: 6379,
    },
    fifo: true,
    lockPrefix: 'my-app',
    retryOptions: {},
    lockTimeout: 10_000,
});

async function myFunction() {
    return mutex.withLock('my-resource', async () => {
        // Access the shared resource here
    });
}
```

### NestJS

#### Registering a Lock

To use a distributed lock in a NestJS application, you need to register it with the `DistributedLockModule`. This module supports both synchronous and asynchronous registration, as well as inheritance from existing locks.

##### Synchronous Registration

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
                    fifo: true,
                },
                adapter: redisMutexLockAdapter,
                name: 'redis',
            },
        ]),
    ],
})
export class AppModule {}
```

##### Asynchronous Registration

```typescript
import { Module } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';
import { advisoryLockAdapter } from '@trellisorg/distributed-lock/advisory-lock';

@Module({
    imports: [
        DistributedLockModule.registerAsync([
            {
                useFactory: () => ({
                    config: {
                        lockPrefix: 'my-app',
                        retryOptions: {},
                        lockTimeout: 10_000,
                        pg: 'postgres://localhost:5432',
                    },
                    adapter: advisoryLockAdapter,
                }),
                name: 'advisory',
            },
        ]),
    ],
})
export class AppModule {}
```

##### Inheriting from Existing Locks

```typescript
import { Module } from '@nestjs/common';
import { DistributedLockModule } from '@trellisorg/distributed-lock/nest';

@Module({
    imports: [
        DistributedLockModule.inherit([
            {
                config: {
                    lockTimeout: 20_000,
                },
                name: 'redis2',
                inheritFrom: 'redis',
            },
        ]),
    ],
})
export class AppModule {}
```

#### Injecting and Using a Lock

Once a lock is registered, you can inject it into your services using the `@InjectLock` decorator.

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedLock } from '@trellisorg/distributed-lock';
import { InjectLock } from '@trellisorg/distributed-lock/nest';

@Injectable()
export class MyService {
    constructor(@InjectLock('redis') private readonly redisLock: DistributedLock) {}

    async myMethod() {
        return this.redisLock.withLock('my-resource', async () => {
            // Access the shared resource here
        });
    }
}
```

## Available Lock Adapters

This library provides the following lock adapters:

-   `redisMutexLockAdapter`: Implements distributed locking using Redis mutexes.
-   `advisoryLockAdapter`: Implements distributed locking using PostgreSQL advisory locks.

## API

### `DistributedLock` Class

The `DistributedLock` class provides the following methods:

-   `lock(lockName: string | string[], options?: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number }): Promise<{ unlock: UnlockFn; lockValue?: string }>`: Acquires a lock synchronously and returns an unlock function.
    -   `lockName`: The name of the resource to lock on. This can be a single string or an array of strings for multi-resource locking.
    -   `options`:
        -   `retryOptions`: Options for retrying lock acquisition (see promise-retry documentation). Defaults to an empty object.
        -   `lockTimeout`: The time it will take the lock to time out and throw an error. Optional and will override whatever was configured at the lock level. Defaults to the lock timeout configured at the lock level.
-   `checkLock(lockName: string | string[]): Promise<void>`: Checks if the lock can be acquired without actually acquiring it. Rejects if the lock is taken.
    -   `lockName`: The name of the resource to lock on. This can be a single string or an array of strings for multi-resource locking.
-   `withLock<ReturnType>(lockName: string | string[], lockedFunction: LockedFunction<ReturnType>, options?: { retryOptions?: Partial<RetryOptions>; lockTimeout?: number }): Promise<ReturnType>`: Acquires a lock, executes a provided function, and releases the lock.
    -   `lockName`: The name of the resource to lock on. This can be a single string or an array of strings for multi-resource locking.
    -   `lockedFunction`: The function to execute while the lock is held.
    -   `options`:
        -   `retryOptions`: Options for retrying lock acquisition (see promise-retry documentation). Defaults to an empty object.
        -   `lockTimeout`: The time it will take the lock to time out and throw an error. Optional and will override whatever was configured at the lock level. Defaults to the lock timeout configured at the lock level.

## License

MIT
