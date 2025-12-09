import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type {
    Project,
    ProjectDetail,
    ProjectListResponse,
    UpdateProjectRequest,
    ProjectGraphResponse,
} from '@/types';

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<ProjectListResponse> {
    const response = await apiClient.get<ProjectListResponse>(
        API_ENDPOINTS.PROJECTS_LIST
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

/**
 * Get knowledge graph for entire project (all meetings combined)
 */
export async function getProjectGraph(projectId: string): Promise<ProjectGraphResponse> {
    const response = await apiClient.get<ProjectGraphResponse>(
        API_ENDPOINTS.PROJECT_GRAPH(projectId)
    );
    return response.data;
}
