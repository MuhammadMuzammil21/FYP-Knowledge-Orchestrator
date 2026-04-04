/**
 * Authentication Service
 * Handles all authentication-related API operations
 */

import { BaseService } from './base/BaseService';
import { ENDPOINT_CONFIG } from '@/lib/config/endpoints.config';
import { adaptUser, adaptTokenResponse } from '@/lib/api/adapters/ResponseAdapter';
import {
  adaptLoginRequest,
  adaptSignupRequest,
  adaptProfileUpdateRequest,
} from '@/lib/api/adapters/RequestAdapter';
import type {
  User,
  LoginCredentials,
  SignupCredentials,
  TokenResponse,
} from '@/types/domain.types';

/**
 * Authentication Service Class
 */
export class AuthService extends BaseService<User> {
  constructor() {
    super({
      resourceName: 'auth',
      baseEndpoint: ENDPOINT_CONFIG.auth.base,
      enableCache: false, // Don't cache auth requests
    });
  }

  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const requestData = adaptLoginRequest(credentials);

    const response = await this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.login}`,
      data: requestData,
    });

    return adaptTokenResponse(response);
  }

  /**
   * User signup
   */
  async signup(credentials: SignupCredentials): Promise<TokenResponse> {
    const requestData = adaptSignupRequest(credentials);

    const response = await this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.signup}`,
      data: requestData,
    });

    return adaptTokenResponse(response);
  }

  /**
   * Get current user
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.me}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return adaptUser(response);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.verifyEmail}`,
      data: { token },
    });
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.resendVerification}`,
      data: { email },
    });
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    return this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.forgotPassword}`,
      data: { email },
    });
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.resetPassword}`,
      data: {
        token,
        new_password: newPassword,
      },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    const requestData = adaptProfileUpdateRequest(data);

    const response = await this.request({
      method: 'PUT',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.auth.endpoints.updateProfile}`,
      data: requestData,
    });

    return adaptUser(response);
  }
}

/**
 * Export singleton instance
 */
export const authService = new AuthService();
