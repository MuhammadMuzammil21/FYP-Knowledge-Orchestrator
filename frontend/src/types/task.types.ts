/**
 * Task Manager Types
 * Reflects the actual API schema from /openapi.json
 *
 * Key notes from API inspection:
 * - task_id   → integer
 * - project_id in task context → integer
 * - Status values (backend): "pending" | "in_progress" | "completed"
 * - Priority values (backend): "low" | "medium" | "high"
 * - Task body field is "description" (not "task")
 * - Due date field is "due_date" (ISO date string)
 */

/** Backend canonical status values */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

/** Backend canonical priority values */
export type TaskPriority = 'high' | 'medium' | 'low';

/** Display labels for status */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

/** Display labels for priority */
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/**
 * A Task as returned by the API (all GET endpoints).
 * The API returns `{}` schema so we define the shape based on TaskCreate + TaskPatch.
 */
export interface Task {
  id: number;
  description: string;
  category?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;       // ISO date string e.g. "2026-05-01"
  notes?: string | null;
  assignee_name?: string | null;
  assignee_user_id?: string | null;
  assignee_speaker_id?: string | null;
  meeting_id?: string | null;
  project_id?: number | null;
  source?: string | null;         // "manual" | "pipeline" | meeting_id
  language?: string | null;       // BCP-47 code or "original"
  created_at?: string;
  updated_at?: string;
}

/** Filters for GET /api/tasks */
export interface TaskFilters {
  project_id?: string;   // Project UUID (string)
  meeting_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_user_id?: string;
  assignee_name?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

/** POST /api/tasks body — TaskCreate schema */
export interface CreateTaskRequest {
  meeting_id: string;
  description: string;
  assignee_name?: string | null;
  due_date?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  notes?: string | null;
  source?: string;
}

/** PATCH /api/tasks/{task_id} body — TaskPatch schema */
export interface UpdateTaskRequest {
  description?: string | null;
  assignee_name?: string | null;
  due_date?: string | null;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  notes?: string | null;
}

/** POST /api/tasks/{task_id}/assign body — TaskAssign schema */
export interface AssignTaskRequest {
  email: string;
}

/**
 * Response from GET /api/projects/{project_id}/tasks
 * Groups tasks by meeting_id for the cross-meeting board.
 */
export interface ProjectTaskBoardResponse {
  by_meeting: Record<string, Task[]>;
  total_count?: number;
}

/** Filters for GET /api/projects/{project_id}/tasks */
export interface ProjectTaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_user_id?: string;
  limit?: number;
  offset?: number;
}
