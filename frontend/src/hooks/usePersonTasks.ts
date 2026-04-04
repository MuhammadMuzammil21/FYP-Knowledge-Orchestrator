/**
 * Hooks for People/Person Tasks
 * React Query hooks for people-related operations
 */

import { useQuery } from '@tanstack/react-query';
import { peopleService } from '@/lib/services';

/**
 * Hook to fetch tasks for a person
 */
export function usePersonTasks(personName: string, projectId?: string) {
  return useQuery({
    queryKey: ['person-tasks', personName, projectId],
    queryFn: () => peopleService.getPersonTasks(personName, projectId),
    enabled: !!personName,
    staleTime: 60000, // 1 minute
  });
}
