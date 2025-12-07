/**
 * Legacy Constants File
 * 
 * This file maintains backward compatibility with existing code.
 * All values are now re-exported from the new modular configuration system.
 * 
 * For new code, prefer importing directly from:
 * - @/lib/config/api.config
 * - @/lib/config/endpoints.config
 * - @/lib/config/app.config
 */

import { API_CONFIG } from './config/api.config';
import { ENDPOINT_CONFIG } from './config/endpoints.config';
import { APP_CONFIG } from './config/app.config';

// Re-export API base URL for backward compatibility
export const API_BASE_URL = API_CONFIG.baseURL;

// Re-export API endpoints for backward compatibility
export const API_ENDPOINTS = {
    // Auth
    AUTH_SIGNUP: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.signup}`,
    AUTH_LOGIN: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.login}`,
    AUTH_ME: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.me}`,
    AUTH_VERIFY_EMAIL: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.verifyEmail}`,
    AUTH_RESEND_VERIFICATION: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.resendVerification}`,
    AUTH_FORGOT_PASSWORD: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.forgotPassword}`,
    AUTH_RESET_PASSWORD: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.resetPassword}`,
    AUTH_UPDATE_PROFILE: `${ENDPOINT_CONFIG.auth.base}${ENDPOINT_CONFIG.auth.endpoints.updateProfile}`,

    // Meetings
    MEETINGS_UPLOAD: `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.upload}`,
    MEETINGS_LIST: ENDPOINT_CONFIG.meetings.base,
    MEETING_DETAIL: (id: string) => `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.detail(id)}`,
    MEETING_STATUS: (id: string) => `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.status(id)}`,
    MEETING_TRANSCRIPT: (id: string) => `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.transcript(id)}`,
    MEETING_TRANSCRIPT_STREAM: (id: string) => `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.transcriptStream(id)}`,
    MEETING_ENTITIES: (id: string) => `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.entities(id)}`,
    MEETING_SEARCH: (id: string) => `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.search(id)}`,
    MEETING_RAG_QUERY: (id: string) => `${ENDPOINT_CONFIG.meetings.base}${ENDPOINT_CONFIG.meetings.endpoints.ragQuery(id)}`,
} as const;

// Re-export file upload settings
export const ALLOWED_FILE_TYPES = APP_CONFIG.upload.allowedFileTypes;
export const ALLOWED_FILE_EXTENSIONS = APP_CONFIG.upload.allowedFileExtensions;
export const MAX_FILE_SIZE = APP_CONFIG.upload.maxFileSize;

// Re-export polling settings
export const STATUS_POLL_INTERVAL = APP_CONFIG.polling.statusInterval;

// Re-export pagination settings
export const PAGINATION_DEFAULTS = {
    LIMIT: APP_CONFIG.pagination.defaultLimit,
    MAX_LIMIT: APP_CONFIG.pagination.maxLimit,
    OFFSET: APP_CONFIG.pagination.defaultOffset,
} as const;

// Re-export UI settings
export const MEETING_STATUS_COLORS = APP_CONFIG.ui.meetingStatusColors;
export const STAGE_LABELS = APP_CONFIG.ui.stageLabels;
