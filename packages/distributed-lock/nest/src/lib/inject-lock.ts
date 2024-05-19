import { Inject } from '@nestjs/common';
import { getLockToken } from './get-lock-token';

/**
 * Decorator to pull a named lock from DI.
 *
 * @param name - The name of the lock.
 */
export const InjectLock = (name: string) => Inject(getLockToken(name));
