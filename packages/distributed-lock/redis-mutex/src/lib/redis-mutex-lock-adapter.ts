import { RedisMutex } from './redis-mutex';
import type { RedisMutexLockOptions } from './redis-mutex-lock-options';

export function redisMutexLockAdapter(options: RedisMutexLockOptions): RedisMutex {
    return new RedisMutex(options);
}
