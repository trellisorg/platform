import { HttpClient } from '@angular/common/http';
import type { Provider } from '@angular/core';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { LoaderOptions, MapsSdkFactory, PlacesAutocompleteConfig } from '@trellisorg/google-places-autocomplete';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { GOOGLE_MAPS_SDK_FACTORY } from '@trellisorg/google-places-autocomplete';

const MAP_API_JS_URL = `https://maps.googleapis.com/maps/api/js`;
const searchParams: (keyof LoaderOptions)[] = ['channel', 'client', 'version', 'id', 'libraries', 'language', 'region'];

function formatOptions(config: PlacesAutocompleteConfig): string {
    const url = new URL(MAP_API_JS_URL);

    url.searchParams.set('key', config.apiKey);

    searchParams.forEach((param) => {
        const value = config.loaderOptions[param];
        if (param && value) {
            url.searchParams.set(param, value.toString());
        }
    });

    return url.toString();
}

/**
 * Loads the Maps SDK using JSONP. This tricks the browser into loading the url as a JS file that is then
 * inserted as a script tag thus adding `google` to the `window` object.
 *
 * Read more here: https://codecraft.tv/courses/angular/http/jsonp-with-observables/
 * @param httpClient
 */
export function useJsonp(httpClient: HttpClient): MapsSdkFactory {
    return async (config: PlacesAutocompleteConfig): Promise<typeof google> => {
        await firstValueFrom(httpClient.jsonp(formatOptions(config), 'callback'));

        return google;
    };
}

export function provideJsonpLoader(): Provider {
    return {
        provide: GOOGLE_MAPS_SDK_FACTORY,
        useFactory: (httpClient: HttpClient) => useJsonp(httpClient),
        deps: [HttpClient],
    };
}
