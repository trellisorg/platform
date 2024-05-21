import Redis from 'ioredis';
import { createHash, randomUUID } from 'node:crypto';
import promiseRetry from 'promise-retry';
import { limitScript, type LuaScript } from './lua';
import {
    defaultRateLimiterOptions,
    type DistributedRateLimiterOptions,
    type ShouldRetry,
    type WithLimitFn,
} from './rate-limit-options';

export class DistributedRateLimiter {
    readonly #client: Redis;
    readonly #options: DistributedRateLimiterOptions;
    readonly limitScript: LuaScript;

    constructor(readonly _options: Partial<DistributedRateLimiterOptions>) {
        this.#options = { ...defaultRateLimiterOptions, ..._options };

        if (this.#options.client instanceof Redis) {
            this.#client = this.#options.client;
        } else {
            this.#client = new Redis(this.#options.client);
        }

        this.limitScript = {
            source: limitScript,
        };
    }

    /**
     * Run a function within a rate limit function that will allow retrying the function based on the validity of
     * the retryFunctions.
     */
    async withLimit<T>(resource: string, fn: WithLimitFn<T>, retryFunctions?: ShouldRetry[]): Promise<T> {
        await this.limit(resource);

        const shouldRetryFns = retryFunctions ?? this.#options.retryFunctions;

        return shouldRetryFns.length === 0
            ? fn()
            : promiseRetry(async (retry) => {
                  try {
                      return await fn();
                  } catch (e) {
                      const shouldRetry = await Promise.any(shouldRetryFns.map((f) => f(e)));

                      if (shouldRetry) {
                          // Limit the call again when retrying it.
                          await this.limit(resource);

                          return retry(e);
                      }

                      throw e;
                  }
              }, this.#options.retryOptions);
    }

    /**
     * Ensure that the limiter has capacity to make a call, will wait until capacity has been replenished.
     */
    async limit(resource: string): Promise<void> {
        const limitedValue = randomUUID();

        const hash = await this.#getScriptHash(this.limitScript);

        await promiseRetry(async (retry) => {
            const response = await this.#_limit({
                resource,
                max: this.#options.maximum,
                window: this.#options.window,
                limitedValue,
                hash,
            });

            if (response === 'OK') {
                return;
            }

            return retry(new Error(response as string));
        }, this.#options.retryOptions);
    }

    /**
     * Simple wrapper function that ensures the call to evalsha is type safe based on the keys configured for the
     * {@link limitScript}
     *
     * @param resource - The resource that will be added to the end of the prefix.
     * @param max - The max number of operations that can be made within the window.
     * @param window - The window in milliseconds that the number of operations can be made in.
     * @param limitedValue - A uniquely generated internal value that ensures we can query by the prefix +
     *   resource.
     * @param hash - The hash of the loaded script in Redis.
     */
    async #_limit({
        resource,
        max,
        window,
        limitedValue,
        hash,
    }: {
        resource: string;
        max: number;
        window: number;
        limitedValue: string;
        hash: string;
    }): Promise<unknown> {
        return this.#client.evalsha(
            hash,
            4,
            `${this.#options.rateLimiterPrefix}:${resource}`,
            max,
            window,
            limitedValue
        );
    }

    /**
     * Load the Lua script into Redis based on its hash and then save that hash so that evalsha can be used as it
     * will be faster.
     */
    async #getScriptHash(script: LuaScript): Promise<string> {
        if (script.hash == null) {
            script.hash = this.#hash(script.source);

            await this.#client.script('LOAD', script.source);
        }

        return script.hash;
    }

    /**
     * Generate a sha1 hash compatible with redis evalsha.
     */
    #hash(value: string): string {
        return createHash('sha1').update(value).digest('hex');
    }
}
