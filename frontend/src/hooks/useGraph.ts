import { useQuery } from '@tanstack/react-query';
import { getMeetingGraph, getPersonTasks } from '@/lib/api/graph';

/**
 * Hook to fetch meeting knowledge graph
 */
export function useMeetingGraph(meetingId: string) {
  return useQuery({
    queryKey: ['meeting-graph', meetingId],
    queryFn: () => getMeetingGraph(meetingId),
    enabled: !!meetingId,
    staleTime: 10 * 60 * 1000, // 10 minutes (graphs are expensive)
  });
}

/**
 * Hook to fetch all tasks for a person
 */
export function usePersonTasks(personName: string, projectId?: string) {
  return useQuery({
    queryKey: ['person-tasks', personName, projectId],
    queryFn: async () => {
      const response = await getPersonTasks(personName, projectId);
      return response.tasks;
    },
    enabled: !!personName,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
