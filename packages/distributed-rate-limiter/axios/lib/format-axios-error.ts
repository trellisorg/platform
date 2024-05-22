import type { AxiosError, AxiosHeaders, RawAxiosRequestHeaders } from 'axios';

const ALWAYS_HIDE_HEADERS: string[] = ['Authorization'];

interface AxiosConfig {
    method?: string;
    url?: string;
    headers?: RawAxiosRequestHeaders & AxiosHeaders;
    data?: Record<string, unknown>;
    baseUrl?: string;
    params?: Record<string, unknown>;
}

export interface FormatAxiosErrorConfig {
    hideHeaders?: string[];
}

/**
 * Formats the Axios error into a structure we know can be stringified with all relevant properties.
 */
export function formatAxiosError(error: AxiosError, config: FormatAxiosErrorConfig = {}) {
    // Need to clone the object so that when/if we edit it then it is not the same headers object that is reused.
    const headers = structuredClone(error.config?.headers.toJSON() ?? {});

    const hideHeaders = [...(config?.hideHeaders ?? []), ...ALWAYS_HIDE_HEADERS].map((header) =>
        header.toLowerCase()
    );

    hideHeaders.forEach((header) => {
        headers[header] = '<hidden>';
    });

    const axiosConfig: AxiosConfig = {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data,
        baseUrl: error.config?.baseURL,
        params: error.config?.params,
    };

    const formatted = {
        message: error.message,
        name: error.name,
        config: axiosConfig,
        response: {
            status: error.response?.status,
            data: error.response?.data,
            statusText: error.response?.statusText,
        },
    };

    return {
        ...formatted,
        command: generateCurlCommand(formatted.config, hideHeaders),
        config: {
            ...formatted.config,
            headers: {
                ...headers,
            },
        },
    } as const;
}

function stringifyHeaders(config: AxiosConfig, hideHeaders: string[]): string {
    const headers = config.headers;

    if (!headers) {
        return '';
    }

    let curlHeaders = '';

    Object.entries(headers.toJSON())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([property, value]) => {
            const header = `${property}:${hideHeaders.includes(property.toLowerCase()) ? '<hidden>' : value}`;
            curlHeaders = `${curlHeaders} -H '${header}'`;
        });

    return curlHeaders.trim();
}

function stringifyMethod(config: AxiosConfig): string {
    return `-X ${config.method}`;
}

function stringifyBody(config: AxiosConfig): string {
    if (!config.data || !['POST', 'PUT'].includes((config.method ?? '').toUpperCase())) {
        return '';
    }

    return `--data '${JSON.stringify(config.data ?? {})}'`.trim();
}

function stringifyUrl(config: AxiosConfig): string {
    if (config.baseUrl) {
        return new URL(config.url ?? '/', config.baseUrl).toString();
    }

    return config.url ?? '/';
}

function stringifyQueryString(config: AxiosConfig): string {
    const searchParams = new URLSearchParams();

    Object.entries(config.params ?? {}).forEach(([key, value]) => {
        searchParams.set(key, `${value}`);
    });

    return searchParams.toString().trim();
}

export function generateCurlCommand(config: AxiosConfig, hideHeaders: string[]): string {
    let url = stringifyUrl(config);

    const queryParams = stringifyQueryString(config);

    if (queryParams) {
        url = `${url}?${queryParams}`;
    }

    return `curl ${stringifyMethod(config)} "${url}" ${stringifyHeaders(config, hideHeaders)} ${stringifyBody(
        config
    )}`
        .trim()
        .replace(/\s{2,}/g, ' ');
}
