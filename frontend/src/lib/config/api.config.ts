/**
 * API Configuration
 * Central configuration for API settings, versioning, and behavior
 */

export const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://asim-ai.duckdns.org',
    version: 'v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    retryBackoffMultiplier: 2,
} as const;

/**
 * Get full API URL with version prefix
 */
export const getApiUrl = (path: string, version?: string): string => {
    const apiVersion = version || API_CONFIG.version;
    const basePath = path.startsWith('/') ? path : `/${path}`;

    // For now, API doesn't use versioning in URL, but structure supports it
    return `${API_CONFIG.baseURL}${basePath}`;
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
    return process.env.NODE_ENV === 'development';
};

/**
 * Check if we're in production mode
 */
export const isProduction = (): boolean => {
    return process.env.NODE_ENV === 'production';
};
