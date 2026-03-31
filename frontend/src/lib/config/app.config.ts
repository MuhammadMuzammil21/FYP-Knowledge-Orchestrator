/**
 * Application Configuration
 * General application settings and constants
 */

export const APP_CONFIG = {
    /**
     * File upload settings
     */
    upload: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedFileTypes: [
            'audio/mpeg', // mp3
            'audio/wav', // wav
            'audio/x-m4a', // m4a
            'audio/mp4', // m4a
            'audio/ogg', // ogg
        ],
        allowedFileExtensions: ['.mp3', '.wav', '.m4a', '.ogg'],
    },

    /**
     * Pagination settings
     */
    pagination: {
        defaultLimit: 50,
        maxLimit: 100,
        defaultOffset: 0,
    },

    /**
     * Polling settings
     */
    polling: {
        statusInterval: 3000, // 3 seconds
        defaultInterval: 5000, // 5 seconds
    },

    /**
     * UI settings
     */
    ui: {
        meetingStatusColors: {
            queued: 'bg-accent/10 text-accent',
            processing: 'bg-primary/10 text-primary',
            completed: 'bg-accent/15 text-accent',
            error: 'bg-destructive/10 text-destructive',
        },
        stageLabels: {
            asr_pending: 'Waiting for transcription',
            asr_processing: 'Transcribing audio',
            asr_done: 'Transcription complete',
            llm_cleanup: 'Cleaning transcript',
            llm_done: 'Cleanup complete',
            insights_processing: 'Extracting insights',
            completed: 'Complete',
            error: 'Error',
        },
    },

    /**
     * Cache settings
     */
    cache: {
        staleTime: {
            meetings: 30000, // 30 seconds
            meetingDetail: 60000, // 1 minute
            transcript: 300000, // 5 minutes
            entities: 300000, // 5 minutes
        },
    },
} as const;

/**
 * Type-safe config getters
 */
export const getUploadConfig = () => APP_CONFIG.upload;
export const getPaginationConfig = () => APP_CONFIG.pagination;
export const getPollingConfig = () => APP_CONFIG.polling;
export const getUIConfig = () => APP_CONFIG.ui;
export const getCacheConfig = () => APP_CONFIG.cache;
