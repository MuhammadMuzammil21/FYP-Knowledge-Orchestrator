/**
 * useTasks — React Query hooks for task read operations
 */

import { useQuery } from '@tanstack/react-query';
import { getTasks, getTask, getProjectTasks, getMeetingTasks } from '@/lib/api/tasks';
import type { TaskFilters, ProjectTaskFilters } from '@/types/task.types';

/** Fetch all accessible tasks with optional filters */
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters ?? {}],
    queryFn: () => getTasks(filters),
    staleTime: 60_000, // 1 minute
  });
}

/** Fetch a single task by integer ID */
export function useTask(taskId: number | undefined) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId!),
    enabled: taskId !== undefined,
    staleTime: 60_000,
  });
}

/** Cross-meeting task board for a project */
export function useProjectTasks(projectId: number | undefined, filters?: ProjectTaskFilters) {
  return useQuery({
    queryKey: ['project-tasks', projectId, filters ?? {}],
    queryFn: () => getProjectTasks(projectId!, filters),
    enabled: projectId !== undefined,
    staleTime: 60_000,
  });
}

/** All tasks for a specific meeting */
export function useMeetingTasks(meetingId: string | undefined, status?: string) {
  return useQuery({
    queryKey: ['meeting-tasks', meetingId, status],
    queryFn: () => getMeetingTasks(meetingId!, status),
    enabled: !!meetingId,
    staleTime: 60_000,
  });
}
