import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { DynamicInput, DynamicOutput } from '@trellisorg/rx-dynamic-component';

@Directive({
    standalone: true,
    selector: '[inputOutputAdapter]',
})
export class StandaloneAdapterDirective {
    @DynamicInput() @Input() name: string | null = '';

    @DynamicOutput() @Output() myName = new EventEmitter<string>();
}
