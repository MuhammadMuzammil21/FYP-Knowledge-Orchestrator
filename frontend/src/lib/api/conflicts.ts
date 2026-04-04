import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type { ProjectConflictsResponse, ConflictDetail, ResolveConflictRequest } from '@/types';

/**
 * Get all conflicts detected within a project across meetings
 */
export async function getProjectConflicts(projectId: string): Promise<ProjectConflictsResponse> {
  const response = await apiClient.get<ProjectConflictsResponse>(
    API_ENDPOINTS.PROJECT_CONFLICTS(projectId)
  );
  return response.data;
}

/**
 * Mark a conflict as resolved
 */
export async function resolveConflict(
  projectId: string,
  conflictId: number,
  data: ResolveConflictRequest
): Promise<ConflictDetail> {
  const response = await apiClient.put<ConflictDetail>(
    API_ENDPOINTS.PROJECT_RESOLVE_CONFLICT(projectId, conflictId),
    data
  );
  return response.data;
}
