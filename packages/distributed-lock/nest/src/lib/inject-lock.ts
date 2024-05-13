import { Inject } from '@nestjs/common';
import { getLockToken } from './get-lock-token';

export const InjectLock = (name: string) => Inject(getLockToken(name));
