/**
 * API Endpoints Configuration
 * Centralized endpoint definitions organized by resource
 * 
 * Benefits:
 * - Single source of truth for all endpoints
 * - Easy to update when backend changes
 * - Type-safe endpoint access
 * - Supports dynamic parameters
 */

export const ENDPOINT_CONFIG = {
    /**
     * Authentication endpoints
     */
    auth: {
        base: '/api/auth',
        endpoints: {
            signup: '/signup',
            login: '/login',
            me: '/me',
            verifyEmail: '/verify-email',
            resendVerification: '/resend-verification',
            forgotPassword: '/forgot-password',
            resetPassword: '/reset-password',
            updateProfile: '/profile',
        },
    },

    /**
     * Meeting endpoints
     */
    meetings: {
        base: '/api/meetings',
        endpoints: {
            list: '',
            upload: '/upload',
            detail: (id: string) => `/${id}`,
            status: (id: string) => `/${id}/status`,
            transcript: (id: string) => `/${id}/transcript`,
            transcriptStream: (id: string) => `/${id}/transcript/stream`,
            entities: (id: string) => `/${id}/entities`,
            conflicts: (id: string) => `/${id}/conflicts`,
            search: (id: string) => `/${id}/search`,
            ragQuery: (id: string) => `/${id}/rag/query`,
            // NEW: Speaker endpoints
            speakers: (id: string) => `/${id}/speakers`,
            speakerDetail: (meetingId: string, speakerId: number) => `/${meetingId}/speakers/${speakerId}`,
            // NEW: Meeting graph endpoint
            graph: (id: string) => `/${id}/graph`,
        },
    },

    /**
     * Project endpoints
     */
    projects: {
        base: '/api/projects',
        endpoints: {
            list: '',
            detail: (id: string) => `/${id}`,
            update: (id: string) => `/${id}`,
            graph: (id: string) => `/${id}/graph`,
            conflicts: (id: string) => `/${id}/conflicts`,
            resolveConflict: (projectId: string, conflictId: number) => `/${projectId}/conflicts/${conflictId}/resolve`,
        },
    },

    /**
     * People endpoints
     */
    people: {
        base: '/api/people',
        endpoints: {
            // NEW: Person tasks endpoint
            tasks: (name: string) => `/${name}/tasks`,
        },
    },

    /**
     * Known Speakers endpoints
     */
    knownSpeakers: {
        base: '/api/known-speakers',
        endpoints: {
            list: '',
            create: '',
            update: (id: number) => `/${id}`,
            delete: (id: number) => `/${id}`,
        },
    },

    /**
     * User endpoints
     */
    users: {
        base: '/api/users',
        endpoints: {
            me: '/me',
            updateMe: '/me',
        },
    },
} as const;

/**
 * Build full endpoint path
 */
export const buildEndpoint = (
    resource: keyof typeof ENDPOINT_CONFIG,
    endpoint: string,
    params?: Record<string, string>
): string => {
    const config = ENDPOINT_CONFIG[resource];
    let path = `${config.base}${endpoint}`;

    // Replace path parameters if provided
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            path = path.replace(`:${key}`, value);
        });
    }

    return path;
};

/**
 * Get endpoint for a resource
 */
export const getEndpoint = (
    resource: keyof typeof ENDPOINT_CONFIG,
    endpointKey: string
): string => {
    const config = ENDPOINT_CONFIG[resource];
    const endpoint = (config.endpoints as any)[endpointKey];

    if (typeof endpoint === 'function') {
        throw new Error(`Endpoint ${endpointKey} requires parameters. Use the function directly.`);
    }

    return `${config.base}${endpoint}`;
};
