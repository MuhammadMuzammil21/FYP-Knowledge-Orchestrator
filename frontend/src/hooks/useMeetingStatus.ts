import { useQuery } from '@tanstack/react-query';
import { getMeetingStatus } from '@/lib/api/meetings';
import { STATUS_POLL_INTERVAL } from '@/lib/constants';

export function useMeetingStatus(meetingId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['meeting-status', meetingId],
        queryFn: () => getMeetingStatus(meetingId),
        enabled: enabled && !!meetingId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            // Stop polling if completed or error
            if (status === 'completed' || status === 'error') {
                return false;
            }
            return STATUS_POLL_INTERVAL; // 3 seconds
        },
    });
}
