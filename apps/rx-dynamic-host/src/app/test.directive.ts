import { Directive, EventEmitter, Output } from '@angular/core';
import { DynamicOutput } from '@trellisorg/rx-dynamic-component';

@Directive({
    selector: '[test]',
    standalone: true,
})
export class TestDirective {
    @DynamicOutput() @Output() readonly o = new EventEmitter<void>();

    constructor() {
        console.log('test');
    }
}
