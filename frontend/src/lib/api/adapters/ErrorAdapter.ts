/**
 * Error Adapter
 * Normalize and transform API errors to consistent error objects
 */

import { isApiError, isValidationError, type ApiError } from '@/types/generics.types';

/**
 * Application error class
 */
export class AppError extends Error {
    public status?: number;
    public code?: string;
    public validationErrors?: Array<{ field: string; message: string }>;

    constructor(
        message: string,
        status?: number,
        code?: string,
        validationErrors?: Array<{ field: string; message: string }>
    ) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
        this.validationErrors = validationErrors;
    }
}

/**
 * Adapt API error to application error
 */
export const adaptError = (error: unknown): AppError => {
    // Handle Axios errors
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const data = axiosError.response?.data;
        const status = axiosError.response?.status;

        if (isApiError(data)) {
            return adaptApiError(data, status);
        }

        return new AppError(
            axiosError.message || 'An error occurred',
            status,
            axiosError.code
        );
    }

    // Handle API errors
    if (isApiError(error)) {
        return adaptApiError(error);
    }

    // Handle standard errors
    if (error instanceof Error) {
        return new AppError(error.message);
    }

    // Handle unknown errors
    return new AppError('An unknown error occurred');
};

/**
 * Adapt API error object
 */
const adaptApiError = (apiError: ApiError, status?: number): AppError => {
    const { detail } = apiError;

    // Handle validation errors
    if (isValidationError(detail)) {
        const validationErrors = detail.map((err) => ({
            field: err.loc.join('.'),
            message: err.msg,
        }));

        const message = validationErrors.map((e) => `${e.field}: ${e.message}`).join(', ');

        return new AppError(
            message || 'Validation error',
            status || apiError.status || 400,
            apiError.code || 'VALIDATION_ERROR',
            validationErrors
        );
    }

    // Handle string errors
    return new AppError(
        typeof detail === 'string' ? detail : 'An error occurred',
        status || apiError.status,
        apiError.code
    );
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
    const appError = adaptError(error);

    // Handle specific error codes
    switch (appError.code) {
        case 'VALIDATION_ERROR':
            return appError.validationErrors
                ? appError.validationErrors.map((e) => e.message).join(', ')
                : appError.message;
        case 'UNAUTHORIZED':
            return 'You are not authorized to perform this action';
        case 'FORBIDDEN':
            return 'Access forbidden';
        case 'NOT_FOUND':
            return 'Resource not found';
        default:
            return appError.message;
    }
};

/**
 * Check if error is a specific type
 */
export const isUnauthorizedError = (error: unknown): boolean => {
    const appError = adaptError(error);
    return appError.status === 401 || appError.code === 'UNAUTHORIZED';
};

export const isForbiddenError = (error: unknown): boolean => {
    const appError = adaptError(error);
    return appError.status === 403 || appError.code === 'FORBIDDEN';
};

export const isNotFoundError = (error: unknown): boolean => {
    const appError = adaptError(error);
    return appError.status === 404 || appError.code === 'NOT_FOUND';
};

export const isValidationErrorType = (error: unknown): boolean => {
    const appError = adaptError(error);
    return appError.code === 'VALIDATION_ERROR' || appError.status === 400;
};
