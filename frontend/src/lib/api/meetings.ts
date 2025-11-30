import { apiClient } from './client';
import type {
    Meeting,
    MeetingDetail,
    UploadResponse,
    TranscriptResponse,
    Entities,
    SearchResponse,
    ProcessingStatus,
    RAGResponse,
    ConflictResponse,
    MeetingsResponse
} from '@/types';

export const meetingsApi = {
    // Upload a meeting
    uploadMeeting: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', 'default'); // TODO: Get from context

        return apiClient.post<UploadResponse>('/meetings/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
    },

    // Get all meetings
    getAllMeetings: async (limit = 50, offset = 0): Promise<Meeting[]> => {
        const response = await apiClient.get<MeetingsResponse>('/meetings', {
            params: { limit, offset }
        });
        return response.meetings;
    },

    // Get single meeting details
    getMeeting: async (meetingId: string): Promise<MeetingDetail> => {
        return apiClient.get<MeetingDetail>(`/meetings/${meetingId}`);
    },

    // Get meeting transcript
    getTranscript: async (meetingId: string): Promise<TranscriptResponse> => {
        return apiClient.get<TranscriptResponse>(`/meetings/${meetingId}/transcript`);
    },

    // Search transcript
    searchTranscript: async (meetingId: string, query: string): Promise<SearchResponse> => {
        return apiClient.get<SearchResponse>(`/meetings/${meetingId}/search`, {
            params: { q: query },
        });
    },

    // Get extracted entities
    getEntities: async (meetingId: string): Promise<Entities> => {
        return apiClient.get<Entities>(`/meetings/${meetingId}/entities`);
    },

    // Get processing status
    getStatus: async (meetingId: string): Promise<ProcessingStatus> => {
        return apiClient.get<ProcessingStatus>(`/meetings/${meetingId}/status`);
    },

    // Get RAG query result
    ragQuery: async (meetingId: string, query: string): Promise<RAGResponse> => {
        return apiClient.get<RAGResponse>(`/meetings/${meetingId}/rag/query`, {
            params: { q: query }
        });
    },

    // Get conflicts
    getConflicts: async (meetingId: string): Promise<ConflictResponse> => {
        return apiClient.get<ConflictResponse>(`/meetings/${meetingId}/conflicts`);
    }
};
