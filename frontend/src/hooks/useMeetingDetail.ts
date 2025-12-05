import { useQuery } from '@tanstack/react-query';
import { getMeeting, getTranscript, getEntities, getConflicts } from '@/lib/api/meetings';

export function useMeeting(meetingId: string) {
    return useQuery({
        queryKey: ['meeting', meetingId],
        queryFn: () => getMeeting(meetingId),
        enabled: !!meetingId,
    });
}

export function useTranscript(meetingId: string, type: 'raw' | 'final' = 'final') {
    return useQuery({
        queryKey: ['transcript', meetingId, type],
        queryFn: () => getTranscript(meetingId, type),
        enabled: !!meetingId,
    });
}

export function useEntities(meetingId: string) {
    return useQuery({
        queryKey: ['entities', meetingId],
        queryFn: () => getEntities(meetingId),
        enabled: !!meetingId,
    });
}

export function useConflicts(meetingId: string) {
    return useQuery({
        queryKey: ['conflicts', meetingId],
        queryFn: () => getConflicts(meetingId),
        enabled: !!meetingId,
    });
}
