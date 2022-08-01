import { EventEmitter, inject } from '@angular/core';
import { RxDynamicComponentRegister } from './rx-dynamic-component.register';
import { RxDynamicDirective } from './rx-dynamic.directive';

function decorateOnDestroy(
    ngOnDestroy: () => void | null | undefined,
    extension: () => void
) {
    return function (this: unknown) {
        ngOnDestroy?.call(this);
        extension();
    };
}

export function DynamicOutput() {
    return (target: unknown, propertyName: string) => {
        let register: RxDynamicComponentRegister;

        Object.defineProperty(target, propertyName, {
            set(value: EventEmitter<unknown>) {
                if (!register) {
                    register = inject(RxDynamicComponentRegister);

                    this[`_${propertyName}`] = value;

                    const subscription = register
                        .filterOutputs(propertyName)
                        .subscribe((eventValue) => value.emit(eventValue.data));

                    RxDynamicDirective.prototype['ngOnDestroy'] =
                        decorateOnDestroy(
                            RxDynamicDirective.prototype['ngOnDestroy'],
                            () => {
                                subscription.unsubscribe();
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
