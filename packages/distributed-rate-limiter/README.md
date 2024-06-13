# @trellisorg/distributed-rate-limiter

This library is designed for distributed rate limiting using Redis to ensure that rate limits are not exceeded for internal or external services.

## Installation

```bash
npm install @trellisorg/distributed-rate-limiter ioredis
```

## Setup

### Standalone TypeScript

```typescript
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';

const rateLimiter = new DistributedRateLimiter({
    client: {
        host: 'localhost',
        port: 6379,
    },
    retryOptions: {},
    rateLimiterPrefix: '@trellisorg/distributed-rate-limiter',
    window: 1_000,
    maximum: 10,
    retryFunctions: [],
});

// Limit the number of calls to the function to 10 per second.
await rateLimiter.withLimit('my-resource', async () => {
    // Do something here.
});
```

### NestJS

```typescript
import { Module } from '@nestjs/common';
import { DistributedRateLimiterModule } from '@trellisorg/distributed-rate-limiter/nest';

@Module({
    imports: [
        DistributedRateLimiterModule.forRoot([
            {
                config: {
                    client: {
                        host: 'localhost',
                        port: 6379,
                    },
                    retryOptions: {},
                    rateLimiterPrefix: '@trellisorg/distributed-rate-limiter',
                    window: 1_000,
                    maximum: 10,
                    retryFunctions: [],
                },
                name: 'rateLimiter',
            },
        ]),
    ],
})
export class AppModule {}
```

## Configuration Options

| Option              | Type            | Default                                  | Description                                                                                                                                                                                                                                                 |
| ------------------- | --------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`            | `RedisOptions`  | `{ host: 'localhost', port: 6379 }`      | The connection options for Redis, these will be passed into `ioredis` if a string or redis options or will just use the Redis instance otherwise.                                                                                                           |
| `retryOptions`      | `RetryOptions`  | `{}`                                     | Configuration for retrying, how long, how many times, backoff, etc. These options are directly from promiseRetry and will be passed directly into it.                                                                                                       |
| `rateLimiterPrefix` | `string`        | `'@trellisorg/distributed-rate-limiter'` | A rate limiter prefix that will be used to save the rate limit information "under" (will be used as the Redis key prefix).                                                                                                                                  |
| `window`            | `number`        | `1_000`                                  | The window size for the rate limiter, this will determine the amount of operations per this window. For example, if this is set to 1000 (ms) and {@link maximum} is 10 then there can be 10 operations per second.                                          |
| `maximum`           | `number`        | `10`                                     | The maximum number of operations per the {@link window}.                                                                                                                                                                                                    |
| `retryFunctions`    | `ShouldRetry[]` | `[]`                                     | A series of functions that will be run on errors thrown by the limited function when using the `withLimit` function of the `DistributedRateLimiter` class. If any of these functions return true, the function will be run again after awaiting rate limit. |

## Usage

### Standalone TypeScript

```typescript
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';

const rateLimiter = new DistributedRateLimiter({
    client: {
        host: 'localhost',
        port: 6379,
    },
    retryOptions: {},
    rateLimiterPrefix: '@trellisorg/distributed-rate-limiter',
    window: 1_000,
    maximum: 10,
    retryFunctions: [],
});

// Limit the number of calls to the function to 10 per second.
await rateLimiter.withLimit('my-resource', async () => {
    // Do something here.
});
```

### NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';
import { InjectRateLimiter } from '@trellisorg/distributed-rate-limiter/nest';

@Injectable()
export class MyService {
    constructor(@InjectRateLimiter('rateLimiter') private readonly rateLimiter: DistributedRateLimiter) {}

    async myMethod() {
        await this.rateLimiter.withLimit('my-resource', async () => {
            // Do something here.
        });
    }
}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
