import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '../../../src/lib/api/meetings';
import { QUERY_KEYS } from '../../../src/config/constants';
import type { Meeting, MeetingDetail, UploadResponse, TranscriptResponse, Entities, SearchResponse } from '../../../src/types';

/**
 * Hook to fetch all meetings
 */
export function useMeetings() {
  return useQuery<Meeting[], Error>({
    queryKey: QUERY_KEYS.meetings,
    queryFn: meetingsApi.getAllMeetings,
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
 * Hook to mock complete a meeting (for testing)
 */
export function useMockComplete() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; meeting_id: string },
    Error,
    string
  >({
    mutationFn: (meetingId: string) => meetingsApi.mockComplete(meetingId),
    onSuccess: (_, meetingId) => {
      // Invalidate specific meeting and meetings list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.meeting(meetingId) });
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
 * Hook to poll meeting status
 */
export function useMeetingStatus(meetingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['status', meetingId],
    queryFn: () => meetingsApi.getStatus(meetingId),
    enabled: enabled && !!meetingId,
    refetchInterval: (query) => {
      // Stop polling if status is complete or failed
      const status = query.state.data?.status;
      if (status === 'complete' || status === 'failed') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });
}