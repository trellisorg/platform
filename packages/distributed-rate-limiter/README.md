## Distributed Rate Limiter

This package provides a simple mechanism for rate limiting operations at the distributed level using Redis to ensure that all of your services respect the same rate limits.

## Installation

```bash
npm install @trellisorg/distributed-rate-limiter
```

## Setup

## Distributed Rate Limiter

This package provides a simple mechanism for rate limiting operations at the distributed level using Redis to ensure that all of your services respect the same rate limits.

## Installation

```bash
npm install @trellisorg/distributed-rate-limiter
```

## Setup

### Configuration Standalone

This package uses configuration to define the capacity/time of the limiter and retry options.

**Basic Usage**:

-   Create a `DistributedRateLimiterOptions` object with the options for the rate limiter.

```typescript
import { DistributedRateLimiter, type DistributedRateLimiterOptions } from '@trellisorg/distributed-rate-limiter';

const rateLimiterOptions: DistributedRateLimiterOptions = {
    client: {
        host: 'localhost',
        port: 6379,
    },
    // Optional retry options
    retryOptions: {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 10000,
    },
    // Optional rate limiter prefix
    rateLimiterPrefix: 'my-rate-limiter',
    window: 1000, // 1 second window
    maximum: 10, // Maximum 10 requests per window
};
```

-   Create a new `DistributedRateLimiter` instance with your configuration options.

```typescript
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';

const rateLimiter = new DistributedRateLimiter(rateLimiterOptions);
```

#### Usage Examples

#### Limiting Requests to a Specific Resource

```typescript
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';

const rateLimiter = new DistributedRateLimiter(rateLimiterOptions);

async function doSomething(resource: string): Promise<void> {
    // Limit requests to the specified resource
    await rateLimiter.limit(resource);

    // Proceed with the operation
    console.log(`Processing resource: ${resource}`);
}

doSomething('my-resource');
```

#### Using Rate Limiters with Different Configurations

```typescript
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';

const rateLimiterOptions1 = {
    // ... configuration for rateLimiter1
};

const rateLimiterOptions2 = {
    // ... configuration for rateLimiter2
};

const rateLimiter1 = new DistributedRateLimiter(rateLimiterOptions1);
const rateLimiter2 = new DistributedRateLimiter(rateLimiterOptions2);

async function doSomething1(resource: string): Promise<void> {
    // Use the rate limiter with the first configuration
    await rateLimiter1.limit(resource);

    // Proceed with the operation
    console.log(`Processing resource: ${resource} with rateLimiter1`);
}

async function doSomething2(resource: string): Promise<void> {
    // Use the rate limiter with the second configuration
    await rateLimiter2.limit(resource);

    // Proceed with the operation
    console.log(`Processing resource: ${resource} with rateLimiter2`);
}

doSomething1('my-resource1');
doSomething2('my-resource2');
```

### Configuration NestJS

This package uses configuration to define the capacity/time of the limiter and retry options.

**forRoot**:

-   Create a `config` object with the options for the rate limiter.

```typescript
import { DistributedRateLimiterModule } from '@trellisorg/distributed-rate-limiter/nest';

@Module({
    imports: [
        DistributedRateLimiterModule.forRoot({
            // default config options will be used if no options are provided.
            // config: {
            //     // options provided here...
            // }
            name: 'myRateLimiter',
        }),
    ],
})
export class AppModule {}
```

**forRootAsync**:

-   The configuration for the rate limiter can be passed in asynchronously using `useFactory` to pull from a config service, environment variables, or any other means of making the configuration options available.

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DistributedRateLimiterModule } from '@trellisorg/distributed-rate-limiter/nest';

@Injectable()
export class AppConfigService {
    constructor(private readonly configService: ConfigService) {}

    getRateLimiterConfig(): any {
        // TODO: Get your config options from your preferred source, for example from a config service.
        return this.configService.get('rateLimiterConfig');
    }
}

@Module({
    imports: [
        DistributedRateLimiterModule.forRootAsync({
            name: 'myRateLimiter',
            useFactory: (appConfigService: AppConfigService) => {
                return appConfigService.getRateLimiterConfig();
            },
            inject: [AppConfigService],
        }),
    ],
})
export class AppModule {}
```

#### Injection

Inject the rate limiter into a service or controller using `@InjectRateLimiter`.

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';
import { InjectRateLimiter } from '@trellisorg/distributed-rate-limiter/nest';

@Injectable()
export class MyService {
    constructor(
        @InjectRateLimiter('myRateLimiter')
        private readonly myRateLimiter: DistributedRateLimiter
    ) {}

    async doSomething(): Promise<void> {
        // Use the rate limiter...
        await this.myRateLimiter.limit('myResource');
    }
}
```

#### forFeature

The `forFeature` method allows you to create a feature-specific rate limiter that inherits from a root rate limiter. This allows you to reuse the root rate limiter's Redis configurations but adjust the capacity settings for a particular feature.

```typescript
import { DistributedRateLimiterModule } from '@trellisorg/distributed-rate-limiter/nest';

@Module({
    imports: [
        // Define the root rate limiter
        DistributedRateLimiterModule.forRoot({
            name: 'myRateLimiter',
        }),

        // Define a feature rate limiter that inherits from the root rate limiter
        DistributedRateLimiterModule.forFeature({
            name: 'myFeatureRateLimiter',
            inheritFrom: 'myRateLimiter',
            config: {
                window: 10_000, // Adjust the window for this feature
                maximum: 20, // Adjust the maximum for this feature
            },
        }),
    ],
})
export class AppModule {}
```

## Options

This package provides several options for configuring the rate limiter:

| Option              | Description                                                                                                                                                                                                                  | Default                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `client`            | Connection options for Redis. This can be a string representing the Redis host and port (e.g., 'localhost:6379'), a RedisOptions object from the `ioredis` library, or an existing Redis instance.                           | `localhost:6379`                       |
| `retryOptions`      | Configuration for retrying, how long, how many times, backoff, etc. These options are directly from `promise-retry` and will be passed directly into it.                                                                     | `{}`                                   |
| `rateLimiterPrefix` | A rate limiter prefix that will be used to save the rate limit information "under" (will be used as the Redis key prefix).                                                                                                   | `@trellisorg/distributed-rate-limiter` |
| `window`            | The window size for the rate limiter in milliseconds, this will determine the amount of operations per this window. For example, if this is set to 1000 (ms) and `maximum` is 10 then there can be 10 operations per second. | `1000`                                 |
| `maximum`           | The maximum number of operations per the `window`.                                                                                                                                                                           | `10`                                   |

## Configuration Values

The following table outlines the configuration values that can be used with the `forRoot` and `forRootAsync` methods:

| Configuration Value | Description                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config`            | A configuration object that contains the options for the rate limiter. This object can be used to configure the Redis connection, retry options, rate limiter prefix, window size, and maximum number of operations per window. See the `Options` section for a detailed description of each option.                                                                                                                      |
| `name`              | A unique name for the rate limiter. This name is used to distinguish different rate limiters within your application. If this is left out `root` will be used. This is helpful for creating feature-specific rate limiters with unique configurations, while still reusing the same Redis client for efficiency. This allows you to reuse Redis connections but customize the rate limit behavior for different features. |

## Usage Guides

Here are some examples of how to use the rate limiter:

### Limiting requests to a specific resource

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';
import { InjectRateLimiter } from '@trellisorg/distributed-rate-limiter/nest';

@Injectable()
export class MyService {
    constructor(
        @InjectRateLimiter()
        private readonly rateLimiter: DistributedRateLimiter
    ) {}

    async doSomething(resource: string): Promise<void> {
        // Limit requests to the specified resource
        await this.rateLimiter.limit(resource);

        // Proceed with the operation
        // ...
    }
}
```

### Using rate limiters with different configurations

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedRateLimiter } from '@trellisorg/distributed-rate-limiter';
import { InjectRateLimiter } from '@trellisorg/distributed-rate-limiter/nest';

@Injectable()
export class MyService {
    constructor(
        @InjectRateLimiter('rateLimiter1')
        private readonly rateLimiter1: DistributedRateLimiter,
        @InjectRateLimiter('rateLimiter2')
        private readonly rateLimiter2: DistributedRateLimiter
    ) {}

    async doSomething1(resource: string): Promise<void> {
        // Use the rate limiter with the first configuration
        await this.rateLimiter1.limit(resource);

        // Proceed with the operation
        // ...
    }

    async doSomething2(resource: string): Promise<void> {
        // Use the rate limiter with the second configuration
        await this.rateLimiter2.limit(resource);

        // Proceed with the operation
        // ...
    }
}
```

This example demonstrates how to use multiple rate limiters with different configurations. Each rate limiter can have its own window size, maximum number of operations, and even a different Redis connection.

## License

MIT
