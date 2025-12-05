export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://asim.daaimali.site';

export const API_ENDPOINTS = {
    // Auth
    AUTH_SIGNUP: '/api/auth/signup',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_ME: '/api/auth/me',
    AUTH_VERIFY_EMAIL: '/api/auth/verify-email',
    AUTH_RESEND_VERIFICATION: '/api/auth/resend-verification',
    AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
    AUTH_RESET_PASSWORD: '/api/auth/reset-password',
    AUTH_UPDATE_PROFILE: '/api/auth/profile',

    // Meetings
    MEETINGS_UPLOAD: '/api/meetings/upload',
    MEETINGS_LIST: '/api/meetings',
    MEETING_DETAIL: (id: string) => `/api/meetings/${id}`,
    MEETING_STATUS: (id: string) => `/api/meetings/${id}/status`,
    MEETING_TRANSCRIPT: (id: string) => `/api/meetings/${id}/transcript`,
    MEETING_TRANSCRIPT_STREAM: (id: string) => `/api/meetings/${id}/transcript/stream`,
    MEETING_ENTITIES: (id: string) => `/api/meetings/${id}/entities`,
    MEETING_CONFLICTS: (id: string) => `/api/meetings/${id}/conflicts`,
    MEETING_SEARCH: (id: string) => `/api/meetings/${id}/search`,
    MEETING_RAG_QUERY: (id: string) => `/api/meetings/${id}/rag/query`,
} as const;

export const ALLOWED_FILE_TYPES = [
    'audio/mpeg', // mp3
    'audio/wav', // wav
    'audio/x-m4a', // m4a
    'audio/mp4', // m4a
    'audio/ogg', // ogg
] as const;

export const ALLOWED_FILE_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg'] as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const STATUS_POLL_INTERVAL = 3000; // 3 seconds

export const PAGINATION_DEFAULTS = {
    LIMIT: 50,
    MAX_LIMIT: 100,
    OFFSET: 0,
} as const;

export const MEETING_STATUS_COLORS = {
    queued: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
} as const;

export const STAGE_LABELS = {
    asr_pending: 'Waiting for transcription',
    asr_processing: 'Transcribing audio',
    asr_done: 'Transcription complete',
    llm_cleanup: 'Cleaning transcript',
    llm_done: 'Cleanup complete',
    insights_processing: 'Extracting insights',
    completed: 'Complete',
    error: 'Error',
} as const;
