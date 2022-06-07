import type { Provider } from '@angular/core';
import {
    defaultLoaderOptions,
    defaultOptions,
    GOOGLE_MAPS_SDK_CONFIG,
    PlacesAutocompleteConfig,
} from './types';

export function providePlacesAutocomplete(
    config: Pick<PlacesAutocompleteConfig, 'apiKey'> &
        Partial<Omit<PlacesAutocompleteConfig, 'apiKey'>>
): Provider {
    return {
        provide: GOOGLE_MAPS_SDK_CONFIG,
        useValue: {
            ...config,
            options: {
                ...defaultOptions,
                ...(config.options ?? {}),
            },
            loaderOptions: {
                ...defaultLoaderOptions,
                ...(config.loaderOptions ?? {}),
            },
        },
    };
}
