import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectConflicts, resolveConflict } from '@/lib/api/conflicts';
import type { ProjectConflictsResponse, ResolveConflictRequest } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';

/**
 * Hook to fetch all conflicts for a project
 */
export function useProjectConflicts(projectId: string) {
    return useQuery({
        queryKey: ['conflicts', projectId],
        queryFn: () => getProjectConflicts(projectId),
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Hook to resolve a conflict
 */
export function useResolveConflict() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            projectId,
            conflictId,
            data,
        }: {
            projectId: string;
            conflictId: number;
            data: ResolveConflictRequest;
        }) => resolveConflict(projectId, conflictId, data),
        onSuccess: (_, { projectId }) => {
            // Invalidate conflicts query to refetch
            queryClient.invalidateQueries({ queryKey: ['conflicts', projectId] });

            toast.success('Conflict resolved successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
