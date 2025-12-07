/**
 * Hooks for Speaker Management
 * React Query hooks for speaker-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '@/lib/services';

/**
 * Hook to fetch meeting speakers
 */
export function useSpeakers(meetingId: string) {
    return useQuery({
        queryKey: ['speakers', meetingId],
        queryFn: () => meetingService.getSpeakers(meetingId),
        enabled: !!meetingId,
    });
}

/**
 * Hook to update speaker display name
 */
export function useUpdateSpeaker(meetingId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ speakerId, displayName }: { speakerId: number; displayName: string }) =>
            meetingService.updateSpeaker(meetingId, speakerId, displayName),
        onSuccess: () => {
            // Invalidate speakers query to refetch
            queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
        },
    });
}

/**
 * Hook to add speaker mapping
 */
export function useAddSpeaker(meetingId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ originalLabel, displayName }: { originalLabel: string; displayName: string }) =>
            meetingService.addSpeaker(meetingId, originalLabel, displayName),
        onSuccess: () => {
            // Invalidate speakers query to refetch
            queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
        },
    });
}
