import { isAxiosError, type AxiosError } from 'axios';
import { formatAxiosError, type FormatAxiosErrorConfig } from './format-axios-error';

export interface AxiosRetry429Config {
    /**
     * Either a time in milliseconds that the retry should be paused for or a function that takes in the Axios
     * error and determines how long it should wait before retrying. If {@link retryAfter} is undefined then the
     * retry is attempted right away in the case of the HTTP status code being 429.
     */
    retryAfter?: number | ((error: AxiosError) => number);

    /**
     * A logger instance to pass in that will be used to log warnings about rate limits. This will allow your to
     * pass in an instance that may be hooked into some log tracking/streaming platform.
     */
    logger?: Pick<typeof console, 'warn'>;

    /**
     * Configuration to format the Axios error to ensure that sensitive information is not being logged/recorded.
     */
    formatErrorConfig?: FormatAxiosErrorConfig;
}

const pause = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

/**
 * A pre-built function for Axios requests that will be able to be passed into the `retryFunctions` configuration
 * property of the `DistributedRateLimiter` class. This will configure the rate limiter's `withLimit` function to
 * automatically retry Axios requests that fail with HTTP 429 errors.
 *
 * Allows for configuring a "wait time" that will pause the retry until it resolves. This is helpful in the case
 * where the axios error contains a response header with a value alerting you of how long you should wait before
 * retrying.
 */
export function axiosRetry429({
    retryAfter,
    logger = console,
    formatErrorConfig,
}: AxiosRetry429Config): (error: unknown) => Promise<boolean> {
    return async (error: unknown) => {
        if (isAxiosError(error) && error.status === 429) {
            logger?.warn(
                `Received HTTP 429, considers lowering your rate limiters capacity per second. cURL: ${formatAxiosError(error, formatErrorConfig).command}`
            );

            if (retryAfter == null) {
                return true;
            }

            const retryAfterTime = typeof retryAfter === 'number' ? retryAfter : retryAfter(error);

            await pause(retryAfterTime);

            return true;
        }

        return false;
    };
}
