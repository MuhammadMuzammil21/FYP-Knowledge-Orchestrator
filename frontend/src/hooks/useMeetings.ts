/**
 * useMeetings Hook
 * Workspace-aware meetings fetching — accepts optional teamId for team context.
 */

import { useQuery } from '@tanstack/react-query';
import { meetingService } from '@/lib/services';
import { APP_CONFIG } from '@/lib/config/app.config';
import type { PaginationParams } from '@/types/generics.types';

export function useMeetings(
    params?: PaginationParams & { project_id?: string; team_id?: string | null }
) {
    // Normalise: undefined means "personal" (no team filter forwarded)
    const { team_id, ...restParams } = params ?? {};
    const queryParams = {
        ...restParams,
        ...(team_id ? { team_id } : {}),
    };

    return useQuery({
        queryKey: ['meetings', queryParams],
        queryFn: () => meetingService.getMeetings(queryParams as any),
        staleTime: APP_CONFIG.cache.staleTime.meetings,
    });
}
