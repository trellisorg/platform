import { Inject } from '@nestjs/common';
import { getLockToken } from './get-lock-token';

export const InjectNamedLock = (name: string) => Inject(getLockToken(name));
