import { apiClient } from './client';


export interface ForgotPasswordResponse {
  message: string;
  token?: string; // Only in development
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  email_verified?: boolean;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
  token?: string; // Only in development
}

export const authApi = {
  // Request password reset
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  // Get user profile
  getProfile: async (userId: string): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(`/auth/profile/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<UserProfile> => {
    return apiClient.put<UserProfile>(`/auth/profile/${userId}`, data);
  },

  // Verify email
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    return apiClient.post<VerifyEmailResponse>('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<ResendVerificationResponse> => {
    return apiClient.post<ResendVerificationResponse>('/auth/resend-verification', { email });
  },
};

