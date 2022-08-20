import { inject } from '@angular/core';
import { RxDynamicComponentRegister } from './rx-dynamic-component.register';

/**
 * @description Add @DynamicInput() to @Input()'s on a Directive to pass in input values to a dynamically rendered
 * component based on the registered component currently rendered in the `ViewContainerRef`.
 *
 * A component that will be dynamically rendered, it includes an Input that will be set by your directive.
 *
 * ```
 * @Component({})
 * class MyDynamicComponent {
 *     @Input() loading = false;
 * }
 * ```
 *
 * A custom directive that will pass inputs through to the dynamically rendered component.
 *
 * ```
 * @Directive({
 *     selector: "[myComponentWrapper]",
 * })
 * class MyDynamicDirective {
 *     @DynamicInput() @Input() loading = false;
 * }
 * ```
 *
 * Template that uses the rxDynamic directive and the wrapper component to pass inputs into it.
 *
 * ```
 * <div myComponentWrapper rxDynamic [loading]="loading$ | async"></div>
 * ```
 *
 * @class
 */
export function DynamicInput() {
    return (target: unknown, propertyName: string) => {
        const registerMap = new WeakMap<any, RxDynamicComponentRegister>();

        Object.defineProperty(target, propertyName, {
            set(value: unknown) {
                this[`_${propertyName}`] = value;
                let register = registerMap.get(this);

                if (!register) {
                    register = inject(RxDynamicComponentRegister);

                    registerMap.set(this, register);
                }

                register.setInput(propertyName, value);
            },
            get(): unknown {
                return this[`_${propertyName}`];
            },
        });
    };
}
