# @trellisorg/google-places-autocomplete

A simple library to create a directive that will add Google Places Autocomplete functionality to a an `input` field.

# Setup

Install: `yarn add @trellisorg/google-places-autocomplete`

# Add to `AppModule`

```typescript
import {
  PlacesAutocompleteModule,
  providePlacesAutocomplete,
} from '@trellisorg/google-places-autocomplete';

@NgModule({
    imports: [
        PlacesAutocompleteModule,
    ],
    providers: [
        // PlacesAutocompleteConfig
        providePlacesAutocomplete({
            apiKey: '<your api key>',
            // AutocompleteOptions
            options: {
                /* 
            configurations accepted by the `Autocomplete` constructor.
            https://developers.google.com/maps/documentation/javascript/places-autocomplete#add-autocomplete
             */
            },
            // LoaderOptions
            loaderOptions: {
                /*
            Configurations accepted by the JS SDK loader, these would be the query params for the script tag
            https://developers.google.com/maps/documentation/javascript/places-autocomplete#get-started
             */
            },
        }),
    ],
})
class AppModule {}
```

# Choose a Loader

1. Script tag

https://developers.google.com/maps/documentation/javascript/places-autocomplete#get-started

```html
<script
    async
    defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap"
></script>
```

2. JSONP Loader

```typescript
import { provideJsonpLoader } from '@trellisorg/google-places-autocomplete/jsonp';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

@NgModule({
    providers: [provideJsonpLoader()],
    imports: [HttpClientModule, HttpClientJsonpModule],
})
class AppModule {}
```

3. Google JS SDK Loader

```typescript
import { provideGoogleMapsLoader } from '@trellisorg/google-places-autocomplete/loader';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

@NgModule({
    providers: [provideGoogleMapsLoader()],
})
class AppModule {}
```

# Add directive to an `input` field

```html
<input placesAutocomplete type="text" (placeChanged)="handleChange($event)" />
```
