/**
 * Generic API Types
 * Reusable types for common API patterns
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
    limit?: number;
    offset?: number;
}

/**
 * Generic pagination response
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

/**
 * Generic query parameters
 */
export interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Generic error response
 */
export interface ApiError {
    detail: string | ValidationError[];
    status?: number;
    code?: string;
}

/**
 * Validation error
 */
export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

/**
 * Generic resource identifier
 */
export interface ResourceId {
    id: string;
}

/**
 * Generic timestamp fields
 */
export interface Timestamps {
    created_at: string;
    updated_at?: string;
}

/**
 * Generic status response
 */
export interface StatusResponse {
    status: string;
    message?: string;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
    message: string;
    success: boolean;
}

/**
 * Type guard for API error
 */
export const isApiError = (error: unknown): error is ApiError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'detail' in error
    );
};

/**
 * Type guard for validation errors
 */
export const isValidationError = (detail: unknown): detail is ValidationError[] => {
    return Array.isArray(detail) && detail.length > 0 && 'loc' in detail[0];
};
