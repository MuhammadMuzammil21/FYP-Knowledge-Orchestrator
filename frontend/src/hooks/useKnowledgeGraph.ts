/**
 * Hooks for Knowledge Graph
 * React Query hooks for knowledge graph operations
 */

import { useQuery } from '@tanstack/react-query';
import { meetingService, projectService } from '@/lib/services';

/**
 * Hook to fetch meeting knowledge graph
 */
export function useMeetingGraph(meetingId: string) {
    return useQuery({
        queryKey: ['meeting-graph', meetingId],
        queryFn: () => meetingService.getMeetingGraph(meetingId),
        enabled: !!meetingId,
        staleTime: 300000, // 5 minutes
    });
}

/**
 * Hook to fetch project knowledge graph
 */
export function useProjectGraph(projectId: string) {
    return useQuery({
        queryKey: ['project-graph', projectId],
        queryFn: () => projectService.getProjectGraph(projectId),
        enabled: !!projectId,
        staleTime: 300000, // 5 minutes
    });
}

/**
 * Hook to fetch project conflicts
 */
export function useProjectConflicts(projectId: string) {
    return useQuery({
        queryKey: ['project-conflicts', projectId],
        queryFn: () => projectService.getProjectConflicts(projectId),
        enabled: !!projectId,
        staleTime: 60000, // 1 minute
    });
}
