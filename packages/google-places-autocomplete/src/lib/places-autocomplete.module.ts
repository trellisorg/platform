import { NgModule } from '@angular/core';
import { PlacesAutocompleteDirective } from './places-autocomplete.directive';

@NgModule({
    declarations: [PlacesAutocompleteDirective],
    exports: [PlacesAutocompleteDirective],
})
export class PlacesAutocompleteModule {}
