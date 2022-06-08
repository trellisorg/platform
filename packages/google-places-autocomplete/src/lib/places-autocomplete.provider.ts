import type { Provider } from '@angular/core';
import {
    defaultLoaderOptions,
    defaultOptions,
    GOOGLE_MAPS_SDK_CONFIG,
    PlacesAutocompleteConfig,
} from './types';

type ProviderConfig = Pick<PlacesAutocompleteConfig, 'apiKey'> & {
    loaderOptions: Partial<PlacesAutocompleteConfig['loaderOptions']>;
    options: Partial<PlacesAutocompleteConfig['options']>;
};

export function providePlacesAutocomplete(config: ProviderConfig): Provider {
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
