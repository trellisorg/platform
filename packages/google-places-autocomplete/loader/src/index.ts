import type { Provider } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { PlacesAutocompleteConfig } from '@trellisorg/google-places-autocomplete';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { GOOGLE_MAPS_SDK_FACTORY } from '@trellisorg/google-places-autocomplete';

/**
 * Uses the `@googlemaps/js-api-loader` to asynchronously load the Google SDK for Maps
 * @param config
 */
export async function useLoader(config: PlacesAutocompleteConfig): Promise<typeof google> {
    return new Loader({
        apiKey: config.apiKey,
        ...config.loaderOptions,
    }).load();
}

export function provideGoogleMapsLoader(): Provider {
    return {
        provide: GOOGLE_MAPS_SDK_FACTORY,
        useValue: useLoader,
    };
}
