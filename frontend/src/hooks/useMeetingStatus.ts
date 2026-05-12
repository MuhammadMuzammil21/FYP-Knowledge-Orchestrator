/**
 * Refactored useMeetingStatus Hook
 * Now uses MeetingService with improved polling logic
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { meetingService } from '@/lib/services';
import { APP_CONFIG } from '@/lib/config/app.config';

export function useMeetingStatus(meetingId: string, enablePolling: boolean = false) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['meeting-status', meetingId],
    queryFn: () => meetingService.getMeetingStatus(meetingId),
    enabled: !!meetingId,
    // Auto-stop polling once the meeting reaches a terminal state
    refetchInterval: (query) => {
      if (!enablePolling) return false;
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'error') return false;
      return APP_CONFIG.polling.statusInterval;
    },
    staleTime: 0, // Always fetch fresh status
  });

  // Invalidate related queries when processing completes
  useEffect(() => {
    if (query.data?.status === 'completed' || query.data?.status === 'error') {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['transcript', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['entities', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['conflicts', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId, 'reviewQueue'] });
    }
  }, [query.data?.status, meetingId, queryClient]);

  return query;
}
