import type { ProviderToken } from '@angular/core';
import { inject } from '@angular/core';

function tryInject<T>(token: ProviderToken<T>): T | null {
    try {
        return inject(token);
    } catch (e) {
        return null;
    }
}

function capitalize(str: string): string {
    const [first] = str;
    return `${first.toUpperCase()}${str.substring(1)}`;
}

export function Setter<T>(token: ProviderToken<T>) {
    return (target: unknown, propertyName: string) => {
        const injectMap = new WeakMap<
            // eslint-disable-next-line @typescript-eslint/ban-types
            ProviderToken<T>,
            // eslint-disable-next-line @typescript-eslint/ban-types
            WeakMap<object, T>
        >();

        if (!injectMap.has(token)) {
            injectMap.set(token, new WeakMap());
        }

        let service: T | null | undefined;

        Object.defineProperty(target, propertyName, {
            set(value) {
                service = injectMap.get(token)?.get(this);

                if (!service) {
                    service = tryInject(token);

                    if (service) {
                        injectMap.get(token)?.set(this, service);
                    }
                }

                this[`_${propertyName}`] = value;

                if (service) {
                    const setterKey = `set${capitalize(
                        propertyName
                    )}` as keyof T;
                    const setter = service[setterKey] as unknown as (
                        value: unknown
                    ) => void;

                    setter(value);
                }
            },
            get() {
                return this[`_${propertyName}`];
            },
        });
    };
}
