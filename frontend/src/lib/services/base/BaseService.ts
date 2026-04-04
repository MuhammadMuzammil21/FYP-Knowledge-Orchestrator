/**
 * Base Service Class
 * Abstract base class for all API services
 *
 * Provides:
 * - Common CRUD operations
 * - Request/response transformation
 * - Error handling
 * - Retry logic
 * - Type safety
 */

import apiClient from '@/lib/api/client';
import { API_CONFIG } from '@/lib/config/api.config';
import { adaptError } from '@/lib/api/adapters/ErrorAdapter';
import type { ServiceConfig, RequestConfig, ServiceMethodOptions } from './ServiceConfig';
import type { PaginationParams, QueryParams } from '@/types/generics.types';
import {
  ServiceError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  TimeoutError,
} from './ServiceError';

/**
 * Abstract base service class
 */
export abstract class BaseService<T = any> {
  protected resourceName: string;
  protected baseEndpoint: string;
  protected defaultHeaders: Record<string, string>;
  protected enableCache: boolean;
  protected cacheTime: number;

  constructor(config: ServiceConfig) {
    this.resourceName = config.resourceName;
    this.baseEndpoint = config.baseEndpoint;
    this.defaultHeaders = config.headers || {};
    this.enableCache = config.enableCache ?? true;
    this.cacheTime = config.cacheTime ?? 30000;
  }

  /**
   * Get all resources
   */
  async getAll<R = T[]>(
    params?: PaginationParams & QueryParams,
    options?: ServiceMethodOptions
  ): Promise<R> {
    return this.request<R>({
      method: 'GET',
      url: this.baseEndpoint,
      params,
      ...options,
    });
  }

  /**
   * Get resource by ID
   */
  async getById<R = T>(id: string, options?: ServiceMethodOptions): Promise<R> {
    return this.request<R>({
      method: 'GET',
      url: `${this.baseEndpoint}/${id}`,
      ...options,
    });
  }

  /**
   * Create new resource
   */
  async create<R = T>(data: Partial<T>, options?: ServiceMethodOptions): Promise<R> {
    return this.request<R>({
      method: 'POST',
      url: this.baseEndpoint,
      data,
      ...options,
    });
  }

  /**
   * Update existing resource
   */
  async update<R = T>(id: string, data: Partial<T>, options?: ServiceMethodOptions): Promise<R> {
    return this.request<R>({
      method: 'PUT',
      url: `${this.baseEndpoint}/${id}`,
      data,
      ...options,
    });
  }

  /**
   * Partially update resource
   */
  async patch<R = T>(id: string, data: Partial<T>, options?: ServiceMethodOptions): Promise<R> {
    return this.request<R>({
      method: 'PATCH',
      url: `${this.baseEndpoint}/${id}`,
      data,
      ...options,
    });
  }

  /**
   * Delete resource
   */
  async delete(id: string, options?: ServiceMethodOptions): Promise<void> {
    await this.request<void>({
      method: 'DELETE',
      url: `${this.baseEndpoint}/${id}`,
      ...options,
    });
  }

  /**
   * Centralized request handler
   */
  protected async request<R>(config: RequestConfig): Promise<R> {
    try {
      const headers = {
        ...this.defaultHeaders,
        ...config.headers,
      };

      const timeout = config.timeout || API_CONFIG.timeout;
      const retry = config.retry ?? true;
      const retryAttempts = config.retryAttempts || API_CONFIG.retryAttempts;

      // Make the request with retry logic
      let lastError: any;
      for (let attempt = 0; attempt <= (retry ? retryAttempts : 0); attempt++) {
        try {
          const response = await apiClient.request({
            method: config.method,
            url: config.url,
            data: config.data,
            params: config.params,
            headers,
            timeout,
          });

          return response.data as R;
        } catch (error) {
          lastError = error;

          // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
          const status = (error as any)?.response?.status;
          if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
            break;
          }

          // Don't retry on last attempt
          if (attempt === retryAttempts) {
            break;
          }

          // Wait before retrying (exponential backoff)
          const delay =
            API_CONFIG.retryDelay * Math.pow(API_CONFIG.retryBackoffMultiplier, attempt);
          await this.sleep(delay);
        }
      }

      // All retries failed, throw the last error
      throw this.handleError(lastError);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and transform errors
   */
  protected handleError(error: unknown): Error {
    const appError = adaptError(error);

    // Map to specific service errors
    if (appError.status === 401) {
      return new AuthenticationError(appError.message);
    }

    if (appError.status === 403) {
      return new AuthorizationError(appError.message);
    }

    if (appError.status === 404) {
      return new NotFoundError(this.resourceName);
    }

    if (appError.status === 408) {
      return new TimeoutError(appError.message);
    }

    if (appError.status && appError.status >= 500) {
      return new ServerError(appError.message, appError.status);
    }

    if (appError.code === 'ECONNABORTED' || appError.code === 'ETIMEDOUT') {
      return new TimeoutError();
    }

    if (appError.code === 'ERR_NETWORK') {
      return new NetworkError();
    }

    return new ServiceError(
      appError.message,
      appError.code,
      appError.status,
      appError.validationErrors
    );
  }

  /**
   * Sleep utility for retry delays
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build query string from params
   */
  protected buildQueryString(params?: QueryParams): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}
