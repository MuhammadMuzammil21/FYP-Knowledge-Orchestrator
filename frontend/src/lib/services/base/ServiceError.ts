/**
 * Service Error Classes
 * Custom error types for service layer
 */

/**
 * Base service error
 */
export class ServiceError extends Error {
    public code?: string;
    public status?: number;
    public details?: any;

    constructor(message: string, code?: string, status?: number, details?: any) {
        super(message);
        this.name = 'ServiceError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

/**
 * Network error (connection issues, timeouts, etc.)
 */
export class NetworkError extends ServiceError {
    constructor(message: string = 'Network error occurred', details?: any) {
        super(message, 'NETWORK_ERROR', undefined, details);
        this.name = 'NetworkError';
    }
}

/**
 * Validation error
 */
export class ValidationError extends ServiceError {
    public validationErrors: Array<{ field: string; message: string }>;

    constructor(
        message: string,
        validationErrors: Array<{ field: string; message: string }> = []
    ) {
        super(message, 'VALIDATION_ERROR', 400, validationErrors);
        this.name = 'ValidationError';
        this.validationErrors = validationErrors;
    }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ServiceError {
    constructor(message: string = 'Authentication required') {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization error
 */
export class AuthorizationError extends ServiceError {
    constructor(message: string = 'Access forbidden') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Not found error
 */
export class NotFoundError extends ServiceError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with id '${id}' not found`
            : `${resource} not found`;
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Server error
 */
export class ServerError extends ServiceError {
    constructor(message: string = 'Internal server error', status: number = 500) {
        super(message, 'SERVER_ERROR', status);
        this.name = 'ServerError';
    }
}

/**
 * Timeout error
 */
export class TimeoutError extends ServiceError {
    constructor(message: string = 'Request timeout') {
        super(message, 'TIMEOUT_ERROR', 408);
        this.name = 'TimeoutError';
    }
}
