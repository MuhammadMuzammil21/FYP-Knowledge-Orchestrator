import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '@/lib/api/meetings';
import { QUERY_KEYS } from '@/config/constants';
import type { Meeting, MeetingDetail, UploadResponse } from '@/types';

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
 * Hook to poll meeting status
 */
export function useMeetingStatus(meetingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['status', meetingId],
    queryFn: () => meetingsApi.getStatus(meetingId),
    enabled: enabled && !!meetingId,
    refetchInterval: (data) => {
      // Stop polling if status is complete or failed
      if (data?.status === 'complete' || data?.status === 'failed') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });
}