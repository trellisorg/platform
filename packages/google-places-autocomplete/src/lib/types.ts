import { InjectionToken } from '@angular/core';

type AutocompleteOptions = google.maps.places.AutocompleteOptions;

export type MapsSdkFactory = (
    config: PlacesAutocompleteConfig
) => Promise<typeof google>;

export const GOOGLE_MAPS_SDK_SCRIPT_ID = 'google-maps-js-sdk';

export interface LoaderOptions {
    channel: string;
    client: string;
    version: string;
    id: string;
    libraries: (
        | 'drawing'
        | 'geometry'
        | 'localContext'
        | 'places'
        | 'visualization'
    )[];
    language: string;
    region: string;
}

export interface PlacesAutocompleteConfig {
    apiKey: string;
    options: AutocompleteOptions;
    loaderOptions: LoaderOptions;
    devMode: boolean;
}

export const defaultLoaderOptions: Partial<LoaderOptions> = {
    libraries: ['places'],
    id: GOOGLE_MAPS_SDK_SCRIPT_ID,
};

export const defaultOptions: AutocompleteOptions = {
    fields: ['address_components'],
    types: ['address'],
};

export const GOOGLE_MAPS_SDK_CONFIG =
    new InjectionToken<PlacesAutocompleteConfig>('GOOGLE_MAPS_SDK_CONFIG');

export const GOOGLE_MAPS_SDK_FACTORY = new InjectionToken<MapsSdkFactory>(
    'GOOGLE_MAPS_SDK'
);
