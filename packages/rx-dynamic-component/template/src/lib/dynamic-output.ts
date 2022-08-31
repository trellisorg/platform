import { EventEmitter, inject } from '@angular/core';
import type { DynamicOutputEmission } from '@trellisorg/rx-dynamic-component';
import { RxDynamicComponentRegister } from '@trellisorg/rx-dynamic-component';
import { takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

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
            set(value: EventEmitter<DynamicOutputEmission<unknown, unknown>>) {
                this[`_${propertyName}`] = value;

                let registry = registerMap.get(this);

                if (!registry) {
                    registry = inject(RxDynamicComponentRegister);

                    registerMap.set(this, registry);

                    registry.events$
                        .pipe(
                            filter((event) => event.output === propertyName),
                            takeUntil(registry.destroy$)
                        )
                        .subscribe((eventValue) => value.emit(eventValue));
                }

                registry.setInput(propertyName, value);
            },
            get(): EventEmitter<unknown> {
                return this[`_${propertyName}`];
            },
        });
    };
}
