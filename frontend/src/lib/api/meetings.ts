import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type {
    Meeting,
    MeetingDetail,
    MeetingStatusDetail,
    MeetingUploadResponse,
    MeetingUploadMetadata,
    MeetingListResponse,
    TranscriptResponse,
    EntityResponse,
    ConflictResponse,
    SearchResponse,
    RAGResponse,
    PaginationParams,
} from '@/types';

export async function uploadMeeting(
    file: File,
    projectId: string,
    metadata?: MeetingUploadMetadata
): Promise<MeetingUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiClient.post<MeetingUploadResponse>(
        API_ENDPOINTS.MEETINGS_UPLOAD,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
}

export async function getMeetings(
    params?: PaginationParams & { project_id?: string }
): Promise<MeetingListResponse> {
    const response = await apiClient.get<MeetingListResponse>(
        API_ENDPOINTS.MEETINGS_LIST,
        { params }
    );
    return response.data;
}

export async function getMeeting(meetingId: string): Promise<MeetingDetail> {
    const response = await apiClient.get<MeetingDetail>(
        API_ENDPOINTS.MEETING_DETAIL(meetingId)
    );
    return response.data;
}

export async function getMeetingStatus(meetingId: string): Promise<MeetingStatusDetail> {
    const response = await apiClient.get<MeetingStatusDetail>(
        API_ENDPOINTS.MEETING_STATUS(meetingId)
    );
    return response.data;
}

export async function getTranscript(
    meetingId: string,
    type: 'raw' | 'final' = 'final'
): Promise<TranscriptResponse> {
    const response = await apiClient.get<TranscriptResponse>(
        API_ENDPOINTS.MEETING_TRANSCRIPT(meetingId),
        { params: { type } }
    );
    return response.data;
}

export async function getEntities(meetingId: string): Promise<EntityResponse> {
    const response = await apiClient.get<EntityResponse>(
        API_ENDPOINTS.MEETING_ENTITIES(meetingId)
    );
    return response.data;
}

export async function getConflicts(meetingId: string): Promise<ConflictResponse> {
    const response = await apiClient.get<ConflictResponse>(
        API_ENDPOINTS.MEETING_CONFLICTS(meetingId)
    );
    return response.data;
}

export async function searchMeeting(
    meetingId: string,
    query: string
): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>(
        API_ENDPOINTS.MEETING_SEARCH(meetingId),
        { params: { q: query } }
    );
    return response.data;
}

export async function ragQuery(meetingId: string, query: string): Promise<RAGResponse> {
    const response = await apiClient.get<RAGResponse>(
        API_ENDPOINTS.MEETING_RAG_QUERY(meetingId),
        { params: { q: query } }
    );
    return response.data;
}

// Helper function to create SSE connection for transcript streaming
export function createTranscriptStream(
    meetingId: string,
    token: string,
    onPartial: (text: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
): EventSource {
    const url = `${API_ENDPOINTS.MEETING_TRANSCRIPT_STREAM(meetingId)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('partial', (event) => {
        try {
            const data = JSON.parse(event.data);
            onPartial(data.text);
        } catch (error) {
            onError(error as Error);
        }
    });

    eventSource.addEventListener('done', () => {
        onDone();
        eventSource.close();
    });

    eventSource.onerror = (error) => {
        onError(new Error('Stream connection error'));
        eventSource.close();
    };

    return eventSource;
}
