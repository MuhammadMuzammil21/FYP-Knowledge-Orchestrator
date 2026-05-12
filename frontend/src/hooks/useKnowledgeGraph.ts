import { useQuery } from '@tanstack/react-query';
import { meetingService, projectService } from '@/lib/services';
import apiClient from '@/lib/api/client';

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
export function useProjectConflicts(projectId: string, meetingId?: string) {
  return useQuery({
    queryKey: ['project-conflicts', projectId, meetingId],
    queryFn: () => projectService.getProjectConflicts(projectId, meetingId),
    enabled: !!projectId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch meeting-specific conflicts (Bug 1 fix).
 * Uses GET /api/meetings/{meeting_id}/conflicts instead of the project-level endpoint.
 */
export function useMeetingConflicts(meetingId: string) {
  return useQuery({
    queryKey: ['meeting-conflicts', meetingId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/meetings/${meetingId}/conflicts`);
      return res.data?.conflicts ?? res.data ?? [];
    },
    enabled: !!meetingId,
    staleTime: 60000, // 1 minute
  });
}
