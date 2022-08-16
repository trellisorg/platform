import { EventEmitter, inject } from '@angular/core';
import { takeUntil } from 'rxjs';
import { RxDynamicComponentRegister } from './rx-dynamic-component.register';

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

                let registry = registerMap.get(this);

                if (!registry) {
                    registry = inject(RxDynamicComponentRegister);

                    registerMap.set(this, registry);

                    registry
                        .filterOutputs(propertyName)
                        .pipe(takeUntil(registry.destroy$))
                        .subscribe((eventValue) => value.emit(eventValue.data));
                }

                registry.setInput(propertyName, value);
            },
            get(): EventEmitter<unknown> {
                return this[`_${propertyName}`];
            },
        });
    };
}
