import apiClient from './client';
import type {
  Task,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  ProjectTaskBoardResponse,
  ProjectTaskFilters,
} from '@/types/task.types';

// ─── List / Get ──────────────────────────────────────────────────────────────

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  const response = await apiClient.get<any>('/api/tasks', { params: filters });
  // The API returns {} schema — handle both array and wrapped responses
  const data = response.data;
  if (Array.isArray(data)) return data as Task[];
  if (data && Array.isArray(data.tasks)) return data.tasks as Task[];
  if (data && Array.isArray(data.items)) return data.items as Task[];
  return [];
}

export async function getTask(taskId: number): Promise<Task> {
  const response = await apiClient.get<any>(`/api/tasks/${taskId}`);
  return response.data as Task;
}

// ─── Create / Update / Delete ─────────────────────────────────────────────────

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const response = await apiClient.post<any>('/api/tasks', data);
  return response.data as Task;
}

export async function updateTask(taskId: number, data: UpdateTaskRequest): Promise<Task> {
  const response = await apiClient.patch<any>(`/api/tasks/${taskId}`, data);
  return response.data as Task;
}

export async function deleteTask(taskId: number): Promise<{ message: string }> {
  const response = await apiClient.delete<any>(`/api/tasks/${taskId}`);
  return response.data ?? { message: 'Deleted' };
}

// ─── Assign ───────────────────────────────────────────────────────────────────

export async function assignTask(taskId: number, data: AssignTaskRequest): Promise<any> {
  const response = await apiClient.post<any>(`/api/tasks/${taskId}/assign`, data);
  return response.data;
}

// ─── Cross-meeting / Meeting-scoped ───────────────────────────────────────────

export async function getProjectTasks(
  projectId: number,
  filters?: ProjectTaskFilters
): Promise<ProjectTaskBoardResponse> {
  const response = await apiClient.get<any>(`/api/projects/${projectId}/tasks`, {
    params: filters,
  });
  const data = response.data;
  // Normalise: API returns opaque {} — try to detect by_meeting shape
  if (data && typeof data === 'object' && data.by_meeting) {
    return data as ProjectTaskBoardResponse;
  }
  // Fallback: if it returns a flat array, group by meeting_id
  const tasks: Task[] = Array.isArray(data) ? data : data?.tasks ?? [];
  const byMeeting: Record<string, Task[]> = {};
  for (const t of tasks) {
    const key = t.meeting_id ?? 'unknown';
    if (!byMeeting[key]) byMeeting[key] = [];
    byMeeting[key].push(t);
  }
  return { by_meeting: byMeeting };
}

export async function getMeetingTasks(
  meetingId: string,
  status?: string
): Promise<Task[]> {
  const response = await apiClient.get<any>(`/api/meetings/${meetingId}/tasks`, {
    params: status ? { status } : undefined,
  });
  const data = response.data;
  if (Array.isArray(data)) return data as Task[];
  if (data && Array.isArray(data.tasks)) return data.tasks as Task[];
  return [];
}

// ─── Speaker Rematch ──────────────────────────────────────────────────────────

export async function rematchSpeakers(
  meetingId: string,
  force = false
): Promise<{ message: string }> {
  const response = await apiClient.post<any>(
    `/api/meetings/${meetingId}/speakers/rematch`,
    null,
    { params: { force } }
  );
  return response.data ?? { message: 'Rematch triggered' };
}
