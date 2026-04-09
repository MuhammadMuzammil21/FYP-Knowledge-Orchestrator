/**
 * Hooks for Speaker Management
 * React Query hooks for speaker-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSpeakers,
  updateSpeaker,
  addSpeaker,
  linkSpeakerToUser,
  unlinkSpeakerFromUser,
  forceLinkEmailSpeaker,
  rematchSpeaker,
  getReviewQueue,
  processReviewProposal,
} from '@/lib/api/speakers';

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

/**
 * Hook to link speaker to user
 */
export function useLinkSpeaker(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ speakerId, userId }: { speakerId: number; userId: string }) =>
      linkSpeakerToUser(meetingId, speakerId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
    },
  });
}

/**
 * Hook to unlink speaker from user
 */
export function useUnlinkSpeaker(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ speakerId }: { speakerId: number }) =>
      unlinkSpeakerFromUser(meetingId, speakerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
    },
  });
}

/**
 * Hook to force link speaker to user by email
 */
export function useForceLinkEmailSpeaker(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ speakerId, email }: { speakerId: number; email: string }) =>
      forceLinkEmailSpeaker(meetingId, speakerId, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['knownSpeakers'] });
    },
  });
}

/**
 * Hook to rematch a speaker
 */
export function useRematchSpeaker(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ speakerId }: { speakerId: number }) =>
      rematchSpeaker(meetingId, speakerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
    },
  });
}

/**
 * Hook to fetch speaker review queue
 */
export function useReviewQueue(meetingId: string) {
  return useQuery({
    queryKey: ['speakers', meetingId, 'reviewQueue'],
    queryFn: async () => {
      const response = await getReviewQueue(meetingId);
      return response.proposals || []; // Extract proposals array
    },
    enabled: !!meetingId,
  });
}

/**
 * Hook to process a review proposal
 */
export function useProcessReviewProposal(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ speakerId, proposalId, action }: { speakerId: number; proposalId: number; action: 'confirm' | 'correct' | 'dismiss' }) =>
      processReviewProposal(meetingId, speakerId, proposalId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['speakers', meetingId, 'reviewQueue'] });
    },
  });
}
