import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Output,
} from '@angular/core';
import { GOOGLE_MAPS_SDK_CONFIG, GOOGLE_MAPS_SDK_FACTORY } from './types';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'input[placesAutocomplete]',
})
export class PlacesAutocompleteDirective implements AfterViewInit {
    @Output() readonly placeChanged =
        new EventEmitter<google.maps.places.PlaceResult>();

    private autocomplete?: google.maps.places.Autocomplete;

    private readonly config = inject(GOOGLE_MAPS_SDK_CONFIG);

    private readonly mapsSdkFactory = inject(GOOGLE_MAPS_SDK_FACTORY);

    constructor(private readonly elementRef: ElementRef) {}

    ngAfterViewInit(): void {
        this.init();
    }

    async init(): Promise<void> {
        // Reuse the existing `window.google` if it exists otherwise load it
        const googleMaps =
            typeof google !== 'undefined' && google?.maps?.places?.Autocomplete
                ? google
                : await this.mapsSdkFactory(this.config);

        this.autocomplete = new googleMaps.maps.places.Autocomplete(
            this.elementRef.nativeElement,
            this.config.options
        );

        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete?.getPlace();
            if (place) {
                this.placeChanged.emit(place);
            }
        });
    }
}
