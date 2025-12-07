/**
 * API Request Adapters
 * Transform domain models (camelCase) to API requests (snake_case)
 */

import type { LoginCredentials, SignupCredentials } from '@/types/domain.types';
import type { PaginationParams } from '@/types/generics.types';

/**
 * Adapt login credentials for API
 */
export const adaptLoginRequest = (credentials: LoginCredentials) => {
    return {
        email: credentials.email,
        password: credentials.password,
    };
};

/**
 * Adapt signup credentials for API
 */
export const adaptSignupRequest = (credentials: SignupCredentials) => {
    return {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
    };
};

/**
 * Adapt pagination params for API
 */
export const adaptPaginationParams = (params?: PaginationParams) => {
    if (!params) return undefined;

    return {
        limit: params.limit,
        offset: params.offset,
    };
};

/**
 * Adapt profile update request for API
 */
export const adaptProfileUpdateRequest = (data: { name?: string; email?: string }) => {
    return {
        name: data.name,
        email: data.email,
    };
};

/**
 * Adapt meeting upload request for API
 */
export const adaptMeetingUploadRequest = (
    file: File,
    projectId: string,
    metadata?: Record<string, any>
) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);

    if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
    }

    return formData;
};
