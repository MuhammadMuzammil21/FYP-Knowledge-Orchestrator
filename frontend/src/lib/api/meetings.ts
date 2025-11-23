import { apiClient } from './client';
import type {
  Meeting,
  MeetingDetail,
  MeetingsResponse,
  TranscriptResponse,
  SearchResponse,
  UploadResponse,
  Entities,
} from '@/types';

export const meetingsApi = {
  // Upload a new meeting
  uploadMeeting: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    return apiClient.upload<UploadResponse>('/meetings/upload', file, onProgress);
  },

  // Get all meetings
  getAllMeetings: async (): Promise<Meeting[]> => {
    const response = await apiClient.get<MeetingsResponse>('/meetings');
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
  getStatus: async (meetingId: string): Promise<import('@/types').ProcessingStatus> => {
    return apiClient.get(`/meetings/${meetingId}/status`);
  },

  // Mock complete (for testing)
  mockComplete: async (meetingId: string): Promise<{ message: string; meeting_id: string }> => {
    return apiClient.post(`/meetings/${meetingId}/mock-complete`);
  },
};