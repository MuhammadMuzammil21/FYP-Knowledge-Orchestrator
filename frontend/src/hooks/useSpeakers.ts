/**
 * Hooks for Speaker Management
 * React Query hooks for speaker-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSpeakers, updateSpeaker, addSpeaker } from '@/lib/api/speakers';

/**
 * Hook to fetch meeting speakers
 */
export function useSpeakers(meetingId: string) {
    return useQuery({
        queryKey: ['speakers', meetingId],
        queryFn: async () => {
            const response = await getSpeakers(meetingId);
            return response.speakers; // Extract speakers array
        },
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
            updateSpeaker(meetingId, speakerId, displayName),
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
            addSpeaker(meetingId, { original_label: originalLabel, display_name: displayName }),
        onSuccess: () => {
            // Invalidate speakers query to refetch
            queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
        },
    });
}
