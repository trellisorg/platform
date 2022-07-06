import { Inject } from '@nestjs/common';
import { getPoolServiceToken, getPoolToken } from './tokens';

/**
 * @description Inject a pool by the provider name.
 * @param name
 */
export const InjectPool = (name: string) => Inject(getPoolToken(name));

/**
 * @description Inject the pool service
 * @param name
 */
export const InjectPoolService = (name: string) =>
    Inject(getPoolServiceToken(name));
