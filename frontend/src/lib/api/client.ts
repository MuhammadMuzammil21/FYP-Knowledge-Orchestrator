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
let sessionFailed = false; // Persistent failure flag for the current page session
let refreshSubscribers: ((token: string) => void)[] = [];
let refreshRejections: ((error: any) => void)[] = [];

const subscribeTokenRefresh = (onSuccess: (token: string) => void, onError: (error: any) => void) => {
    refreshSubscribers.push(onSuccess);
    refreshRejections.push(onError);
};

const onRefreshed = (token: string) => {
    isRefreshing = false;
    sessionFailed = false;
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
    refreshRejections = [];
};

const onRefreshFailed = (error: any) => {
    isRefreshing = false;
    sessionFailed = true;
    refreshRejections.forEach((cb) => cb(error));
    refreshSubscribers = [];
    refreshRejections = [];
};

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (sessionFailed && !config.url?.includes('/auth/login')) {
            return Promise.reject({ response: { status: 401 } } as AxiosError);
        }
        if (typeof window !== 'undefined') {
            const manualToken = window.sessionStorage.getItem('harbaat_temp_access_token');
            if (manualToken) {
                config.headers.Authorization = `Bearer ${manualToken}`;
            } else {
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

        if (originalRequest?.url?.includes('/auth/refresh')) {
            sessionFailed = true;
            isRefreshing = false;
            return Promise.reject(axiosError);
        }

        if (axiosError.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            if (window.location.pathname === '/login') {
                return Promise.reject(axiosError);
            }

            if (sessionFailed) {
                return Promise.reject(axiosError);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(
                        (token) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(apiClient(originalRequest));
                        },
                        (err) => reject(err)
                    );
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
                    withCredentials: true 
                });
                
                const newAccessToken = data.access_token;
                window.sessionStorage.setItem('harbaat_temp_access_token', newAccessToken);
                
                onRefreshed(newAccessToken);
                
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                onRefreshFailed(refreshError);
                window.sessionStorage.removeItem('harbaat_temp_access_token');
                
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?error=SessionExpired';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(axiosError);
    }
);

export default apiClient;

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        if (data?.detail) {
            if (typeof data.detail === 'string') {
                return data.detail;
            } else if (Array.isArray(data.detail)) {
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
