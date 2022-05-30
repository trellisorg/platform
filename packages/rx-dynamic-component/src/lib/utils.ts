import type { Type } from '@angular/core';

export function isStandaloneComponent<T = any>(type: Type<T>): boolean {
    return type['ɵcmp' as keyof Type<T>]?.standalone === true;
}
