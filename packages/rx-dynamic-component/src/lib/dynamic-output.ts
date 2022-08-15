import { EventEmitter, inject } from '@angular/core';
import { RxDynamicComponentRegister } from './rx-dynamic-component.register';
import { RxDynamicDirective } from './rx-dynamic.directive';

/**
 * @description Patches `ngOnDestroy` for a certain adapter directive so that subscriptions are cleaned up when a
 * dynamic outlet is destroyed.
 *
 * @param ngOnDestroy
 * @param extension
 */
export function decorateOnDestroy(ngOnDestroy: () => void | null | undefined, extension: () => void) {
    return function (this: unknown) {
        ngOnDestroy?.call(this);
        extension();
    };
}

/**
 * @description Wrap an @Output() EventEmitter in `@DynamicOutput()` to pass events up from a dynamically rendered
 * component to the template rendering it.
 *
 * @class
 */
export function DynamicOutput() {
    return (target: unknown, propertyName: string) => {
        const registerMap = new WeakMap<any, RxDynamicComponentRegister>();

        Object.defineProperty(target, propertyName, {
            set(value: EventEmitter<unknown>) {
                this[`_${propertyName}`] = value;

                let register = registerMap.get(this);

                if (!register) {
                    register = inject(RxDynamicComponentRegister);

                    registerMap.set(this, register);

                    const subscription = register
                        .filterOutputs(propertyName)
                        .subscribe((eventValue) => value.emit(eventValue.data));

                    RxDynamicDirective.prototype['ngOnDestroy'] = decorateOnDestroy(
                        RxDynamicDirective.prototype['ngOnDestroy'],
                        () => {
                            subscription?.unsubscribe();
                        }
                    );
                }

                register.setInput(propertyName, value);
            },
            get(): EventEmitter<unknown> {
                return this[`_${propertyName}`];
            },
        });
    };
}
