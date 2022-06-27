export const providerPrefix = `nest-worker-thread`;

export const WORKER_DATA = Symbol(`${providerPrefix}-worker-data`);
export const THREAD_ID = Symbol(`${providerPrefix}-id`);

export const getPoolToken = (name: string) => `${providerPrefix}-${name}-pool`;
