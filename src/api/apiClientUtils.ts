import { logger } from "../logger/logger";

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
export const createApiClient = (basePath: string, debugMode: boolean=false) => {
    if (basePath==undefined) {
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

        logger.log(`Sending ${method} request to ${url}`, debugMode)

        if (method === 'GET' && body) {
            throw new Error('GET requests cannot have a body');
        }

        // Prepare the request body and headers
        let requestBody: BodyInit | undefined;
        const finalHeaders = { ...headers };

        if (body instanceof FormData) {
            // If body is FormData, do not set Content-Type (browser will handle it)
            requestBody = body;
        } else if (body) {
            // Assume JSON body
            requestBody = JSON.stringify(body);
            finalHeaders['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body: requestBody,
        });

        logger.log(`Response status: ${response.status}`, debugMode)
        logger.log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`, debugMode)
        logger.log(`Response URL: ${response.url}`, debugMode)
        logger.log(`Response body: ${await response.text()}`, debugMode)


        if (!response.ok) {
            const errorData = await response.json();
            return errorData as T;
        }
        
        // Handle no content for 202 or other no-body status codes
        if (response.status === 202 || response.status === 204 || !response.headers.get('Content-Type')) {
            const body = await response.json().catch(() => null); // Safely attempt to parse body
            // Check if body is not an empty object
            if (body && Object.keys(body).length > 0) {
                return body as T;
            }
            return {} as T; // Return empty object if no content or empty object
        }

        // Return parsed JSON for non-void responses
        return await response.json() as T;
    };

    return {
        get: <T>(
            endpoint: string, 
            queryParameters: Record<string, string | number | boolean | null | undefined> = {},
            pathParameters: unknown = {},
            headers?: Record<string, string>
        ): Promise<T> =>
            request<T>(endpoint, { method: 'GET', headers }, queryParameters, pathParameters),

        post: <T>(
            endpoint: string, 
            body?: unknown,
            pathParameters: unknown = {},
            headers?: Record<string, string>
        ): Promise<T> =>
            request<T>(endpoint, { method: 'POST', body, headers }, {}, pathParameters),

        put: <T>(
            endpoint: string, 
            body?: unknown,
            pathParameters: unknown = {},
            headers?: Record<string, string>
        ): Promise<T> =>
            request<T>(endpoint, { method: 'PUT', body, headers }, {}, pathParameters),

        delete: <T>(
            endpoint: string,
            pathParameters: unknown = {},
            headers?: Record<string, string>
        ): Promise<T> =>
            request<T>(endpoint, { method: 'DELETE', headers }, {}, pathParameters),
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


export const ApiClientUtils = {resolveUrl, createApiClient}