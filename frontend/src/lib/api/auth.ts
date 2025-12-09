import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type {
    LoginCredentials,
    SignupCredentials,
    TokenResponse,
    User,
} from '@/types';

export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>(
        API_ENDPOINTS.AUTH_LOGIN,
        credentials
    );
    return response.data;
}

export async function signup(credentials: SignupCredentials): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>(
        API_ENDPOINTS.AUTH_SIGNUP,
        credentials
    );
    return response.data;
}

export async function getCurrentUser(token: string): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH_ME, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_VERIFY_EMAIL, { token });
    return response.data;
}

export async function resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_RESEND_VERIFICATION, {
        email,
    });
    return response.data;
}

export async function forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
    return response.data;
}

export async function resetPassword(
    token: string,
    newPassword: string
): Promise<{ message: string }> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
        token,
        new_password: newPassword,
    });
    return response.data;
}

export async function updateProfile(data: {
    name?: string;
    email?: string;
}): Promise<User> {
    const response = await apiClient.put<User>(API_ENDPOINTS.AUTH_UPDATE_PROFILE, data);
    return response.data;
}

export async function updateUserProfile(data: {
    name?: string;
}): Promise<User> {
    const response = await apiClient.put<User>(API_ENDPOINTS.USER_UPDATE_PROFILE, data);
    return response.data;
}
