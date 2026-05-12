/**
 * useMeetingDetail Hook
 * Meeting-related data fetching with all new backend endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '@/lib/services';
import {
  deleteMeeting,
  updateTranscript,
  getTranscriptHistory,
  getMeetingAudioUrl,
  reprocessInsights,
  reidentifySpeakers,
  type UpdateTranscriptRequest,
} from '@/lib/api/meetings';
import { APP_CONFIG } from '@/lib/config/app.config';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';
import { useEffect, useState } from 'react';

/**
 * Hook to fetch meeting detail
 */
export function useMeeting(meetingId: string) {
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => meetingService.getMeetingDetail(meetingId),
    enabled: !!meetingId,
    staleTime: APP_CONFIG.cache.staleTime.meetingDetail,
  });
}

/**
 * Hook to fetch meeting transcript
 */
export function useTranscript(meetingId: string, type: 'raw' | 'final' = 'final', enabled: boolean = true) {
  return useQuery({
    queryKey: ['transcript', meetingId, type],
    queryFn: () => meetingService.getTranscript(meetingId, type),
    enabled: !!meetingId && enabled,
    staleTime: APP_CONFIG.cache.staleTime.transcript,
  });
}

/**
 * Hook to fetch meeting entities
 */
export function useEntities(meetingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['entities', meetingId],
    queryFn: () => meetingService.getEntities(meetingId),
    enabled: !!meetingId && enabled,
    staleTime: APP_CONFIG.cache.staleTime.entities,
  });
}

/**
 * Hook to delete a meeting (member role or above)
 */
export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => deleteMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to update a meeting transcript (manual editing).
 */
export function useUpdateTranscript(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTranscriptRequest) => updateTranscript(meetingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcript', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['transcript-history', meetingId] });
      toast.success('Transcript saved successfully');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/**
 * Hook to get transcript version history.
 */
export function useTranscriptHistory(meetingId: string) {
  return useQuery({
    queryKey: ['transcript-history', meetingId],
    queryFn: () => getTranscriptHistory(meetingId),
    enabled: !!meetingId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to load the authenticated audio URL for the meeting.
 * Returns a blob ObjectURL that is safely revoked on unmount.
 */
export function useMeetingAudio(meetingId: string) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) return;
    let objectUrl: string | null = null;
    setIsLoading(true);
    setError(null);

    getMeetingAudioUrl(meetingId)
      .then((url) => {
        objectUrl = url;
        setAudioUrl(url);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => setIsLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [meetingId]);

  return { audioUrl, isLoading, error };
}

/**
 * Hook to trigger insight reprocessing.
 */
export function useReprocessInsights(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reprocessInsights(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['entities', meetingId] });
      toast.success('Insight reprocessing started in background');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
/**
 * Hook to trigger speaker re-identification.
 */
export function useReidentifySpeakers(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reidentifySpeakers(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['entities', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId, 'reviewQueue'] }); // Bug 5
      toast.success('Speaker re-identification started');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
