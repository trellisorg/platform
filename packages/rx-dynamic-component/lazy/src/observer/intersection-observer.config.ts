import { InjectionToken, Provider } from '@angular/core';

export const INTERSECTION_OBSERVER_CONFIG =
    new InjectionToken<IntersectionObserverInit>(
        'INTERSECTION_OBSERVER_CONFIG'
    );

export function provideIntersectionObserverConfig(
    config: IntersectionObserverInit
): Provider {
    return {
        provide: INTERSECTION_OBSERVER_CONFIG,
        useValue: config,
    };
}
