import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '../../../src/lib/api/meetings';
import { QUERY_KEYS } from '../../../src/config/constants';
import type {
    Meeting,
    MeetingDetail,
    UploadResponse,
    TranscriptResponse,
    Entities,
    SearchResponse,
    ProcessingStatus,
    RAGResponse,
    ConflictResponse
} from '../../../src/types';

/**
 * Hook to fetch all meetings
 */
export function useMeetings(limit = 50, offset = 0) {
    return useQuery<Meeting[], Error>({
        queryKey: [...QUERY_KEYS.meetings, limit, offset],
        queryFn: () => meetingsApi.getAllMeetings(limit, offset),
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to fetch single meeting details
 */
export function useMeeting(meetingId: string) {
    return useQuery<MeetingDetail, Error>({
        queryKey: QUERY_KEYS.meeting(meetingId),
        queryFn: () => meetingsApi.getMeeting(meetingId),
        enabled: !!meetingId,
        staleTime: 60000, // 1 minute
    });
}

/**
 * Hook to upload a meeting
 */
export function useUploadMeeting() {
    const queryClient = useQueryClient();

    return useMutation<
        UploadResponse,
        Error,
        { file: File; onProgress?: (progress: number) => void }
    >({
        mutationFn: ({ file, onProgress }) => meetingsApi.uploadMeeting(file, onProgress),
        onSuccess: () => {
            // Invalidate meetings list to refetch
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.meetings });
        },
    });
}

/**
 * Hook to fetch meeting transcript
 */
export function useTranscript(meetingId: string) {
    return useQuery<TranscriptResponse, Error>({
        queryKey: QUERY_KEYS.transcript(meetingId),
        queryFn: () => meetingsApi.getTranscript(meetingId),
        enabled: !!meetingId,
        staleTime: 300000, // 5 minutes
    });
}

/**
 * Hook to fetch extracted entities
 */
export function useEntities(meetingId: string) {
    return useQuery<Entities, Error>({
        queryKey: QUERY_KEYS.entities(meetingId),
        queryFn: () => meetingsApi.getEntities(meetingId),
        enabled: !!meetingId,
        staleTime: 300000, // 5 minutes
    });
}

/**
 * Hook to search transcript
 */
export function useSearchTranscript(meetingId: string, query: string) {
    return useQuery<SearchResponse, Error>({
        queryKey: QUERY_KEYS.search(meetingId, query),
        queryFn: () => meetingsApi.searchTranscript(meetingId, query),
        enabled: !!meetingId && !!query && query.length >= 2,
        staleTime: 60000, // 1 minute
    });
}

/**
 * Hook to poll meeting status with real-time updates
 */
export function useMeetingStatus(meetingId: string, enabled: boolean = true) {
    const queryClient = useQueryClient();

    return useQuery<ProcessingStatus, Error>({
        queryKey: ['status', meetingId],
        queryFn: () => meetingsApi.getStatus(meetingId),
        enabled: enabled && !!meetingId,
        refetchInterval: (query) => {
            // Stop polling if status is complete or failed
            const status = query.state.data?.status;
            if (status === 'complete' || status === 'failed') {
                // Invalidate meeting data when complete to refresh
                if (status === 'complete') {
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.meeting(meetingId) });
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.meetings });
                }
                return false;
            }
            return 2000; // Poll every 2 seconds for real-time updates
        },
        staleTime: 0, // Always consider stale to get fresh updates
    });
}

/**
 * Hook to query RAG
 */
export function useRagQuery(meetingId: string, query: string) {
    return useQuery<RAGResponse, Error>({
        queryKey: ['rag', meetingId, query],
        queryFn: () => meetingsApi.ragQuery(meetingId, query),
        enabled: !!meetingId && !!query && query.length >= 3,
        staleTime: 300000, // 5 minutes
    });
}

/**
 * Hook to fetch conflicts
 */
export function useConflicts(meetingId: string) {
    return useQuery<ConflictResponse, Error>({
        queryKey: ['conflicts', meetingId],
        queryFn: () => meetingsApi.getConflicts(meetingId),
        enabled: !!meetingId,
        staleTime: 300000, // 5 minutes
    });
}
