import { AdvisoryLock } from './advisory-lock';
import type { AdvisoryLockOptions } from './advisory-lock-options';

export function advisoryLockAdapter(options: AdvisoryLockOptions): AdvisoryLock {
    return new AdvisoryLock(options);
}
