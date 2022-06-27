import { Inject } from '@nestjs/common';
import { getPoolToken } from './tokens';

/**
 * @description Inject a pool by the provider name
 * @param name
 */
export const InjectPool = (name: string) => Inject(getPoolToken(name));
