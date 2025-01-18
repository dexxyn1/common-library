export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
}

/**
 * A functional API client that requires a base URL upon creation.
 * Provides utility functions for making HTTP requests with query parameters,
 * custom HTTP methods, headers, and request bodies.
 */
export const createApiClient = (basePath: string) => {
    if (!basePath) {
        throw new Error('Base path is required');
    }
    const sanitizedBasePath = basePath.replace(/\/$/, '');

    const request = async <T>(
        endpoint: string,
        options: ApiOptions = {},
        queryParameters: Record<string, string | number | boolean | null | undefined> = {},
        pathParameters: unknown = {} // New parameter for path placeholders
    ): Promise<T> => {
        const { method = 'GET', headers, body } = options;

        // Resolve the URL template with path parameters
        const resolvedEndpoint = pathParameters ? resolveUrl(endpoint, pathParameters) : endpoint;

        // Construct query string from queryParameters
        const queryString = new URLSearchParams(
            Object.entries(queryParameters).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = String(value);
                }
                return acc;
            }, {} as Record<string, string>)
        ).toString();

        // Append query string to endpoint if queryParameters exist
        const url = queryString ? `${sanitizedBasePath}/${resolvedEndpoint}?${queryString}` : `${sanitizedBasePath}/${resolvedEndpoint}`;
        if (method === 'GET' && body) {
            throw new Error('GET requests cannot have a body');
        }

        const requestBody = body ? JSON.stringify(body) : undefined;
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: requestBody,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        // Handle no content for 202 or other no-body status codes
        if (response.status === 202 || response.status === 204 || !response.headers.get('Content-Type')) {
            return {} as T;
        }
        return await response.json() as T;
    };

    return {
        get: <T>(
            endpoint: string, 
            queryParameters: Record<string, string | number | boolean | null | undefined> = {},
            pathParameters: unknown = {}): Promise<T> =>
            request<T>(endpoint, { method: 'GET' }, queryParameters, pathParameters),

        post: <T>(
            endpoint: string, 
            body?: unknown,
            pathParameters: unknown = {}): Promise<T> =>
            request<T>(endpoint, { method: 'POST', body }, {}, pathParameters),

        put: <T>(
            endpoint: string, 
            body?: unknown,
            pathParameters: unknown = {}): Promise<T> =>
            request<T>(endpoint, { method: 'PUT', body }, {}, pathParameters),

        delete: <T>(
            endpoint: string,
            pathParameters: unknown = {}): Promise<T> =>
            request<T>(endpoint, { method: 'DELETE' }, {}, pathParameters),
    };
};

function resolveUrl(template: string, params: unknown): string {
    if (typeof params !== 'object' || params === null) {
        throw new Error("The 'params' argument must be a non-null object.");
    }

    return template.replace(/:([a-zA-Z_]+)/g, (_, key) => {
        const paramsObj = params as { [key: string]: unknown };

        if (!(key in paramsObj)) {
            throw new Error(`Missing path parameter: ${key}`);
        }

        const value = paramsObj[key];
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new Error(`Invalid type for path parameter: ${key}. Expected a string or number.`);
        }

        return String(value);
    });
}
