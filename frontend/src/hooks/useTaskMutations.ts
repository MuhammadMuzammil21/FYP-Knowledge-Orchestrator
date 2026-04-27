/**
 * useTaskMutations — React Query mutation hooks for task write operations
 * - Optimistic updates for status/priority changes
 * - Cache invalidation on create, delete, assign
 * - Toast feedback via sonner
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  rematchSpeakers,
} from '@/lib/api/tasks';
import { getErrorMessage } from '@/lib/api/client';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
} from '@/types/task.types';

// ─── Create Task ──────────────────────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ─── Update Task (with optimistic update) ────────────────────────────────────

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: UpdateTaskRequest }) =>
      updateTask(taskId, data),

    // Optimistic update: immediately update the task in cache
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['task', taskId] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTask = queryClient.getQueryData<Task>(['task', taskId]);
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Strip null values so we don't violate Task's non-nullable fields (e.g. description: string)
      const patch = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
      ) as Partial<Task>;

      // Update single task cache
      if (previousTask) {
        queryClient.setQueryData<Task>(['task', taskId], { ...previousTask, ...patch });
      }

      // Update list cache — find and patch the task in place
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks'],
          previousTasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
        );
      }

      return { previousTask, previousTasks };
    },

    onError: (error, { taskId }, context) => {
      // Revert optimistic update
      if (context?.previousTask) {
        queryClient.setQueryData(['task', taskId], context.previousTask);
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast.error(getErrorMessage(error));
    },

    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks'] });
    },
  });
}

// ─── Delete Task ──────────────────────────────────────────────────────────────

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks'] });
      toast.success('Task deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ─── Assign Task ──────────────────────────────────────────────────────────────

export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: AssignTaskRequest }) =>
      assignTask(taskId, data),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task assigned successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ─── Rematch Speakers ─────────────────────────────────────────────────────────

export function useRematchSpeakers() {
  return useMutation({
    mutationFn: ({ meetingId, force }: { meetingId: string; force?: boolean }) =>
      rematchSpeakers(meetingId, force),
    onSuccess: () => {
      toast.success('Speaker rematch triggered successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
