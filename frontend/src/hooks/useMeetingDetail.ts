/**
 * Refactored useMeetingDetail Hook
 * Now uses MeetingService for all meeting-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { meetingService } from '@/lib/services';
import { APP_CONFIG } from '@/lib/config/app.config';

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
export function useTranscript(meetingId: string, type: 'raw' | 'final' = 'final') {
    return useQuery({
        queryKey: ['transcript', meetingId, type],
        queryFn: () => meetingService.getTranscript(meetingId, type),
        enabled: !!meetingId,
        staleTime: APP_CONFIG.cache.staleTime.transcript,
    });
}

/**
 * Hook to fetch meeting entities
 */
export function useEntities(meetingId: string) {
    return useQuery({
        queryKey: ['entities', meetingId],
        queryFn: () => meetingService.getEntities(meetingId),
        enabled: !!meetingId,
        staleTime: APP_CONFIG.cache.staleTime.entities,
    });
}
