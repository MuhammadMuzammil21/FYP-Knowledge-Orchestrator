import { useQuery } from '@tanstack/react-query';
import { getMeetings } from '@/lib/api/meetings';
import type { PaginationParams } from '@/types';

export function useMeetings(params?: PaginationParams & { project_id?: string }) {
    return useQuery({
        queryKey: ['meetings', params],
        queryFn: () => getMeetings(params),
        staleTime: 30000, // 30 seconds
    });
}
