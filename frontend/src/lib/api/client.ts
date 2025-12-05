import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';


// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Get token from session (will be set by NextAuth)
        if (typeof window !== 'undefined') {
            // Client-side: get token from session
            const session = await fetch('/api/auth/session').then((res) => res.json());
            if (session?.accessToken) {
                config.headers.Authorization = `Bearer ${session.accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // Handle specific error codes
            if (error.response.status === 401) {
                // Unauthorized - redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            } else if (error.response.status === 403) {
                // Forbidden - might be email not verified
                console.error('Access forbidden:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// Helper function to handle API errors
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        if (data?.detail) {
            if (typeof data.detail === 'string') {
                return data.detail;
            } else if (Array.isArray(data.detail)) {
                // Validation errors
                return data.detail.map((err: any) => err.msg).join(', ');
            }
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
}
