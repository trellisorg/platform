import { Directive, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { DynamicInput, DynamicOutput } from '@trellisorg/rx-dynamic-component';

@Directive({
    standalone: true,
    selector: '[inputOutputAdapter]',
})
export class StandaloneAdapterDirective implements OnDestroy {
    @DynamicInput() @Input() name: string | null = '';

    @DynamicOutput() @Output() myName = new EventEmitter<string>();

    ngOnDestroy(): void {
        console.log('Real on destroy');
    }
}
