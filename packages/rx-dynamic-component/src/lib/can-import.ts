import type { Injector } from '@angular/core';
import type { Observable } from 'rxjs';
import { forkJoin, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import type { DynamicComponentManifest } from './manifest';
import { isFunction, wrapIntoObservable } from './utils';

/**
 * A Guard that is run before loading the manifest
 */
export interface CanImport {
    canImport(
        manifest: DynamicComponentManifest
    ): Observable<boolean> | Promise<boolean> | boolean;
}

export function isCanImport<T extends CanImport>(canImport: T): canImport is T {
    return canImport && isFunction<CanImport>(canImport.canImport);
}

export function inject(injector: Injector, token: any): any {
    return injector.get(token);
}

export function runCanImports(
    injector: Injector,
    manifest: DynamicComponentManifest,
    canImports: any[]
): Observable<boolean> {
    if (!Array.isArray(canImports) || canImports.length === 0) {
        return of(true);
    }

    const tokens = canImports.map((token) => inject(injector, token));

    const validTokens = tokens.filter(isCanImport);

    const obs = validTokens.map((canImport) =>
        wrapIntoObservable(canImport.canImport(manifest)).pipe(first())
    );

    if (obs.length === 0) {
        return of(true);
    }

    return forkJoin(obs).pipe(
        // Using some instead of every is more efficient as we only need one failure to fail the whole thing
        map((results) => !results.some((result) => result === false))
    );
}
