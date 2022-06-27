import { parentPort } from 'worker_threads';
import type { Message } from './types';

/**
 * @description a method decorator to be added to an @Injectable service within a Standalone app
 * that has been bootstrapped inside a Node Worker Thread.
 * @constructor
 */
export function ThreadMessage<T>(this: T, event?: string) {
    return (target: any, propertyKey: string) => {
        if (!parentPort) {
            throw new Error(`Not currently in a Node Worker Thread.`);
        }

        parentPort.on('message', (data: Message) => {
            if (event == null || data.event === event) {
                const result = (
                    target[propertyKey] as (...args: unknown[]) => unknown
                ).call(this, {
                    event: 'message',
                    data,
                });

                // We know parentPort exists because we are current running inside a parentPort callback.
                parentPort!.postMessage(result);
            }
        });
    };
}
