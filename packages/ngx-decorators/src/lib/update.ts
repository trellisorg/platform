import type { ProviderToken } from '@angular/core';
import { inject } from '@angular/core';

function capitalize(str: string): string {
    const [first] = str;
    return `${first.toUpperCase()}${str.substring(1)}`;
}

export function Update<T, K extends keyof T>(
    token: ProviderToken<T>,
    updater?: K
) {
    const injectMap = new WeakMap<
        // eslint-disable-next-line @typescript-eslint/ban-types
        ProviderToken<T>,
        // eslint-disable-next-line @typescript-eslint/ban-types
        WeakMap<object, T>
    >();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const providerMap = (injectMap.get(token) ??
        // eslint-disable-next-line @typescript-eslint/ban-types
        injectMap.set(token, new WeakMap<object, T>()).get(token))!;

    return (target: unknown, propertyName: string) => {
        let service: T | null | undefined;

        const updaterKey =
            updater ?? (`set${capitalize(propertyName)}` as keyof T);

        Object.defineProperty(target, propertyName, {
            set(value) {
                service = providerMap.get(this);

                if (!service) {
                    service = inject(token);

                    providerMap.set(this, service);
                }

                this[`_${propertyName}`] = value;

                const updater = service[updaterKey] as unknown as (
                    value: unknown
                ) => void;

                if (updater) {
                    if (typeof updater === 'function') {
                        updater(value);
                    } else {
                        throw new Error(
                            `${String(updaterKey)} is not function on ${token}`
                        );
                    }
                } else {
                    throw new Error(
                        `${token} does not contain a setter for ${propertyName}`
                    );
                }
            },
            get() {
                return this[`_${propertyName}`];
            },
        });
    };
}
