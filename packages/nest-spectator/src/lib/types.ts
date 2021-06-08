type OptionalPropertyNames<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

type OptionalProperties<T> = Pick<T, OptionalPropertyNames<T>>;

export type OptionalsRequired<T> = Required<OptionalProperties<T>> & Partial<T>;
