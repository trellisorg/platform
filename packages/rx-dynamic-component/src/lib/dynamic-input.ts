import { inject } from '@angular/core';
import { RxDynamicComponentRegister } from './rx-dynamic-component.register';

/**
 * Decorator to add to @Input() properties in a custom directive that will pipe them into the
 * dynamically rendered component.
 * @constructor
 */
export function DynamicInput() {
    return (target: unknown, propertyName: string) => {
        let register: RxDynamicComponentRegister;

        Object.defineProperty(target, propertyName, {
            set(value: unknown) {
                if (!register) {
                    register = inject(RxDynamicComponentRegister);
                }

                this[`_${propertyName}`] = value;

                register.setInput(propertyName, value);
            },
            get(): unknown {
                return this[`_${propertyName}`];
            },
        });
    };
}
