import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for HttpOnly session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache the session promise to avoid N parallel fetches on every request
let sessionPromise: Promise<any> | null = null;

async function getSession() {
  if (typeof window === 'undefined') return null;

  if (!sessionPromise) {
    sessionPromise = fetch('/api/auth/session')
      .then((res) => res.json())
      .catch(() => null)
      .finally(() => {
        // Clear after a short window so it can refresh if needed in next cycle
        setTimeout(() => {
          sessionPromise = null;
        }, 5000);
      });
  }
  return sessionPromise;
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window === 'undefined') return config;

    // Manual override (e.g. for testing with session storage)
    const manualToken = window.sessionStorage.getItem('harbaat_temp_access_token');
    if (manualToken) {
      config.headers.Authorization = `Bearer ${manualToken}`;
      return config;
    }

    // Skip session check for public auth endpoints to avoid blocking requests
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/signup',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/api/auth/resend-verification',
      '/api/auth/google',
    ];

    const isPublicEndpoint = publicEndpoints.some((path) => config.url?.endsWith(path));

    if (isPublicEndpoint || config.url?.endsWith('/api/auth/logout')) {
      return config;
    }

    const session = await getSession();

    // If NextAuth signals a refresh failure, redirect immediately to login
    if (session?.error === 'RefreshAccessTokenError') {
      window.location.href = '/login?error=SessionExpired';
      return Promise.reject(new Error('Session expired'));
    }

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    // Attach workspace ID for multi-tenancy
    const workspaceId = localStorage.getItem('harbaat_active_workspace');
    if (workspaceId) {
      const cleanId = workspaceId.replace(/(^"|"$)/g, '');
      if (cleanId && cleanId !== 'personal') {
        config.headers['X-Workspace-ID'] = cleanId;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor — only handle session errors by retrying once with NextAuth refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError<any>;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If it's a 401 and we aren't already retrying or at the login page
    if (
      axiosError.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      if (window.location.pathname === '/login') {
        return Promise.reject(axiosError);
      }

      // Invalidate the session cache so the next call is fresh
      sessionPromise = null;

      // Ask NextAuth for a fresh session (it will refresh if nearing expiry due to our auth.ts threshold)
      const session = await fetch('/api/auth/session')
        .then((res) => res.json())
        .catch(() => null);

      if (!session?.accessToken || session?.error === 'RefreshAccessTokenError') {
        window.location.href = '/login?error=SessionExpired';
        return Promise.reject(axiosError);
      }

      // Retry the original request ONCE with the new token
      originalRequest._retry = true;
      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
      return apiClient(originalRequest);
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
