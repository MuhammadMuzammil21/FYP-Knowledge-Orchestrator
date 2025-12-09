import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getKnownSpeakers,
    createKnownSpeaker,
    updateKnownSpeaker,
    deleteKnownSpeaker,
} from '@/lib/api/knownSpeakers';
import type { CreateKnownSpeakerRequest, UpdateKnownSpeakerRequest } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';

/**
 * Hook to fetch all known speakers
 */
export function useKnownSpeakers() {
    return useQuery({
        queryKey: ['known-speakers'],
        queryFn: async () => {
            const response = await getKnownSpeakers();
            return response.known_speakers;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to create a new known speaker
 */
export function useCreateKnownSpeaker() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateKnownSpeakerRequest) => createKnownSpeaker(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['known-speakers'] });
            toast.success('Known speaker created successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}

/**
 * Hook to update a known speaker
 */
export function useUpdateKnownSpeaker() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateKnownSpeakerRequest }) =>
            updateKnownSpeaker(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['known-speakers'] });
            toast.success('Known speaker updated successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}

/**
 * Hook to delete a known speaker
 */
export function useDeleteKnownSpeaker() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteKnownSpeaker(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['known-speakers'] });
            toast.success('Known speaker deleted successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
