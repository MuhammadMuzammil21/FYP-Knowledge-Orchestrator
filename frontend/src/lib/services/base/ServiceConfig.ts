/**
 * Service Configuration Types
 */

import type { QueryParams } from '@/types/generics.types';

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  /**
   * Resource name (used for query keys, logging, etc.)
   */
  resourceName: string;

  /**
   * Base endpoint for this resource
   */
  baseEndpoint: string;

  /**
   * Optional custom headers
   */
  headers?: Record<string, string>;

  /**
   * Enable/disable caching for this service
   */
  enableCache?: boolean;

  /**
   * Default cache time in milliseconds
   */
  cacheTime?: number;
}

/**
 * Request configuration
 */
export interface RequestConfig {
  /**
   * HTTP method
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /**
   * Endpoint URL (relative to base)
   */
  url: string;

  /**
   * Request body data
   */
  data?: any;

  /**
   * Query parameters
   */
  params?: QueryParams;

  /**
   * Custom headers for this request
   */
  headers?: Record<string, string>;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Enable/disable retry for this request
   */
  retry?: boolean;

  /**
   * Number of retry attempts
   */
  retryAttempts?: number;
}

/**
 * Service method options
 */
export interface ServiceMethodOptions {
  /**
   * Custom headers
   */
  headers?: Record<string, string>;

  /**
   * Request timeout
   */
  timeout?: number;

  /**
   * Enable/disable retry
   */
  retry?: boolean;

  /**
   * Transform response before returning
   */
  transform?: (data: any) => any;
}
