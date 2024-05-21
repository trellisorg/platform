# @trellisorg/nx-ai-readme

This library provides a distributed rate limiter using Redis to ensure that rate limits are not exceeded for internal or external services.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Configuration Options](#configuration-options)
- [Usage](#usage)
  - [Standalone TypeScript](#standalone-typescript)
  - [NestJS](#nestjs)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @trellisorg/nx-ai-readme
```

## Setup

1. **Install Redis:** Ensure you have Redis installed and running.
2. **Import the library:** Import the necessary components from the library into your project.

## Configuration Options

The library can be configured using the `DistributedRateLimiterOptions` interface.

| Option | Type | Default | Description |
|---|---|---|---|
| `client` | `RedisOptions | Redis` | The connection options for Redis. Defaults to `localhost:6379`. |
| `retryOptions` | `RetryOptions` | `{}` | Configuration for retrying, how long, how many times, backoff, etc. These options are directly from `promiseRetry` and will be passed directly into it. |
| `rateLimiterPrefix` | `string` | `@trellisorg/distributed-rate-limiter` | A rate limiter prefix that will be used to save the rate limit information "under" (will be used as the Redis key prefix). |
| `window` | `number` | `1000` | The window size for the rate limiter, this will determine the amount of operations per this window. For example, if this is set to 1000 (ms) and `maximum` is 10 then there can be 10 operations per second. |
| `maximum` | `number` | `10` | The maximum number of operations per the `window`. |
| `retryFunctions` | `ShouldRetry[]` | `[]` | A series of functions that will be run on errors thrown by the limited function when using the `withLimit` function of the `DistributedRateLimiter` class. If any of these functions return true, the function will be run again after awaiting rate limit. |

## Usage

### Standalone TypeScript

```typescript
import { DistributedRateLimiter } from '@trellisorg/nx-ai-readme';

const rateLimiter = new DistributedRateLimiter({
  client: {
    host: 'localhost',
    port: 6379,
  },
  window: 1000,
  maximum: 10,
});

async function myLimitedFunction() {
  // ... your code ...
}

async function main() {
  await rateLimiter.withLimit('myResource', myLimitedFunction);
}

main();
```

### NestJS

```typescript
import { Module } from '@nestjs/common';
import { DistributedRateLimiterModule } from '@trellisorg/nx-ai-readme/nest';

@Module({
  imports: [
    DistributedRateLimiterModule.forRoot([
      {
        config: {
          client: {
            host: 'localhost',
            port: 6379,
          },
          window: 1000,
          maximum: 10,
        },
        name: 'myRateLimiter',
      },
    ]),
  ],
})
export class AppModule {}
```

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRateLimiter } from '@trellisorg/nx-ai-readme/nest';
import { DistributedRateLimiter } from '@trellisorg/nx-ai-readme';

@Injectable()
export class MyService {
  constructor(
    @InjectRateLimiter('myRateLimiter')
    private readonly rateLimiter: DistributedRateLimiter
  ) {}

  async myLimitedMethod() {
    // ... your code ...
  }

  async myMethod() {
    await this.rateLimiter.withLimit('myResource', this.myLimitedMethod);
  }
}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.