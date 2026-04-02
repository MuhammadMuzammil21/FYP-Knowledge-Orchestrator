import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type {
    Project,
    ProjectDetail,
    ProjectListResponse,
    UpdateProjectRequest,
    CreateProjectRequest,
    ProjectGraphResponse,
} from '@/types';

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<Project>(
        API_ENDPOINTS.PROJECTS_LIST,
        data
    );
    return response.data;
}

/**
 * Get all projects for the current user/workspace
 */
export async function getProjects(
    params?: { team_id?: string; personal?: string }
): Promise<ProjectListResponse> {
    const response = await apiClient.get<ProjectListResponse>(
        API_ENDPOINTS.PROJECTS_LIST,
        { params }
    );
    return response.data;
}

/**
 * Get project details with meetings list
 */
export async function getProject(projectId: string): Promise<ProjectDetail> {
    const response = await apiClient.get<ProjectDetail>(
        API_ENDPOINTS.PROJECT_DETAIL(projectId)
    );
    return response.data;
}

/**
 * Update project name or description
 */
export async function updateProject(
    projectId: string,
    data: UpdateProjectRequest
): Promise<Project> {
    const response = await apiClient.put<Project>(
        API_ENDPOINTS.PROJECT_UPDATE(projectId),
        data
    );
    return response.data;
}

export async function deleteProject(projectId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.PROJECT_DETAIL(projectId)
    );
    return response.data;
}

/**
 * Get knowledge graph for entire project (all meetings combined)
 */
export async function getProjectGraph(projectId: string): Promise<ProjectGraphResponse> {
    const response = await apiClient.get<ProjectGraphResponse>(
        API_ENDPOINTS.PROJECT_GRAPH(projectId)
    );
    return response.data;
}
