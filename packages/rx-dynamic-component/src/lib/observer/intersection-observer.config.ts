import { InjectionToken } from '@angular/core';

export const INTERSECTION_OBSERVER_CONFIG =
    new InjectionToken<IntersectionObserverInit>(
        'INTERSECTION_OBSERVER_CONFIG'
    );
