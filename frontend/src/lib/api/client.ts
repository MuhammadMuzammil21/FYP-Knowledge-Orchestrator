import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';


// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Crucial for HttpOnly session cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Get token from session (will be set by NextAuth)
        if (typeof window !== 'undefined') {
            // First check if we have a manually overriding token from a refresh
            const manualToken = window.sessionStorage.getItem('harbaat_temp_access_token');
            if (manualToken) {
                config.headers.Authorization = `Bearer ${manualToken}`;
            } else {
                // Client-side: get token from NextAuth session
                const session = await fetch('/api/auth/session').then((res) => res.json());
                if (session?.accessToken) {
                    config.headers.Authorization = `Bearer ${session.accessToken}`;
                }
            }
            
            // Client-side: attach workspace ID for multi-tenancy
            const workspaceId = localStorage.getItem('harbaat_active_workspace');
            if (workspaceId && workspaceId !== 'personal' && workspaceId !== '"personal"') {
                const cleanId = workspaceId.replace(/(^"|"$)/g, '');
                if (cleanId && cleanId !== 'personal') {
                    config.headers['X-Workspace-ID'] = cleanId;
                }
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and silent refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        const axiosError = error as AxiosError<any>;
        const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (axiosError.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call backend refresh endpoint
                const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
                    withCredentials: true 
                });
                
                const newAccessToken = data.access_token;
                
                // Store temporarily so subsequent requests can use it immediately
                window.sessionStorage.setItem('harbaat_temp_access_token', newAccessToken);
                
                onRefreshed(newAccessToken);
                
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clean up and redirect to login
                window.sessionStorage.removeItem('harbaat_temp_access_token');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?error=SessionExpired';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(axiosError);
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
