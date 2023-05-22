/** Credit to: Valentin Buryakov
 * @ngneat/spectator - https://github.com/ngneat/spectator
 */
import type { Type } from '@nestjs/common';
import type { FactoryProvider } from '@nestjs/common/interfaces';

type Writable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * @publicApi
 */
export type BaseSpyObject<T> = T & // eslint-disable-next-line @typescript-eslint/ban-types
{ [P in keyof T]: T[P] extends Function ? T[P] & CompatibleSpy : T[P] } & {
    /**
     * Casts to type without readonly properties
     */
    castToWritable(): Writable<T>;
};

/**
 * @publicApi
 */
export interface CompatibleSpy extends jasmine.Spy {
    /**
     * By chaining the spy with and.returnValue, all calls to the function will return a specific
     * value.
     */
    andReturn(val: any): void;

    /**
     * By chaining the spy with and.callFake, all calls to the spy will delegate to the supplied
     * function.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    andCallFake(fn: Function): this;

    /**
     * removes all recorded calls
     */
    reset(): void;
}

/**
 * @publicApi
 */
export type SpyObject<T> = BaseSpyObject<T> & {
    [P in keyof T]: T[P] & (T[P] extends (...args: any[]) => infer R ? jest.Mock<R> : T[P]);
};

/**
 * @internal
 */
export function installProtoMethods<T>(
    mock: any,
    proto: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    createSpyFn: Function
): void {
    if (proto === null || proto === Object.prototype) {
        return;
    }

    for (const key of Object.getOwnPropertyNames(proto)) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);

        if (!descriptor) {
            continue;
        }

        if (typeof descriptor.value === 'function' && key !== 'constructor' && typeof mock[key] === 'undefined') {
            mock[key] = createSpyFn(key);
            // eslint-disable-next-line no-prototype-builtins
        } else if (descriptor.get && !mock.hasOwnProperty(key)) {
            Object.defineProperty(mock, key, {
                set: (value) => (mock[`_${key}`] = value),
                get: () => mock[`_${key}`],
            });
        }
    }

    installProtoMethods(mock, Object.getPrototypeOf(proto), createSpyFn);

    mock.castToWritable = () => mock;
}

/**
 * @publicApi
 */
export function createSpyObject<T>(
    type: Type<T> & { prototype: T },
    template?: Partial<Record<keyof T, any>>
): SpyObject<T> {
    const mock: any = { ...template } || {};

    installProtoMethods(mock, type.prototype, () => {
        const jestFn = jest.fn();
        const newSpy: CompatibleSpy = jestFn as any;

        // eslint-disable-next-line @typescript-eslint/ban-types
        newSpy.andCallFake = (fn: Function) => {
            jestFn.mockImplementation(fn as (...args: any[]) => any);

            return newSpy;
        };

        newSpy.andReturn = (val: any) => {
            jestFn.mockReturnValue(val);
        };

        newSpy.reset = () => {
            jestFn.mockReset();
        };

        return newSpy;
    });

    return mock;
}

/**
 * @publicApi
 */
export function mockProvider<T>(type: Type<T>, properties?: Partial<Record<keyof T, any>>): FactoryProvider {
    return {
        provide: type,
        useFactory: () => createSpyObject(type, properties),
    };
}
