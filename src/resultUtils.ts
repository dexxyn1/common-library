// ResultUtils type for consistent responses

import {formatDateTime} from "./dateUtils";

type SuccessResult<T> = {success: true, data: T}
export type  ErrorResult = {success: false, error: StandardError}
export interface StandardError {
    name: string;               // Error type or name (e.g., "ValidationError", "DatabaseError")
    message: string;            // Descriptive error message
    code?: string;              // Optional error code (e.g., "400", "DB_CONN_ERR")
    statusCode?: number;        // HTTP status code (e.g., 404, 500)
    details?: Record<string, unknown>; // Additional details for debugging (e.g., invalid fields)
    timestamp?: string;          // ISO string timestamp for when the error occurred
    stack?: string;             // Optional stack trace for debugging
}
export type Result<T> = SuccessResult<T> | ErrorResult;


/**
 * Converts a promise into a ResultUtils type, wrapping its success and error outcomes.
 *
 * @param data - Data to be wrapped in ResultUtils type
 * @returns A ResultUtils<T, E> representing the outcome of the promise.
 */
export function toResult<T>(data: T
): Result<T> {
    return { success: true, data: data };
}

export function errorToErrorResult(error: Error
): ErrorResult {
    return { success: false, error: error };
}

export type ErrorName = "UnhandledError" | "Duplicate" | "NotFound" | "ApiError" | "ValidationError";

export function toErrorResult(name: ErrorName, message: string, details?: Record<string, unknown>, code?: string,  statusCode?: number
): ErrorResult {
    return { success: false, error: {
            name: name,
            message: message,
            code: code,
            details: details,
            statusCode: statusCode,
            timestamp: formatDateTime(new Date())
        } };
}

