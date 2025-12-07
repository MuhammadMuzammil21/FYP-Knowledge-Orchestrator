/**
 * Refactored useMeetings Hook
 * Now uses MeetingService instead of direct API calls
 * 
 * Benefits:
 * - Cleaner separation of concerns
 * - Easier to test
 * - Consistent error handling
 * - Automatic data transformation
 */

import { useQuery } from '@tanstack/react-query';
import { meetingService } from '@/lib/services';
import { APP_CONFIG } from '@/lib/config/app.config';
import type { PaginationParams } from '@/types/generics.types';

export function useMeetings(params?: PaginationParams & { project_id?: string }) {
    return useQuery({
        queryKey: ['meetings', params],
        queryFn: () => meetingService.getMeetings(params),
        staleTime: APP_CONFIG.cache.staleTime.meetings,
    });
}
