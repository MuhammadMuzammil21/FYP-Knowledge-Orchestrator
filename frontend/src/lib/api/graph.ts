import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type {
    MeetingGraphResponse,
    PersonTasksResponse,
} from '@/types';

/**
 * Get knowledge graph for a single meeting
 */
export async function getMeetingGraph(meetingId: string): Promise<MeetingGraphResponse> {
    const response = await apiClient.get<MeetingGraphResponse>(
        API_ENDPOINTS.MEETING_GRAPH(meetingId)
    );
    return response.data;
}

/**
 * Get all tasks assigned to a person
 */
export async function getPersonTasks(
    name: string,
    projectId?: string
): Promise<PersonTasksResponse> {
    const response = await apiClient.get<PersonTasksResponse>(
        API_ENDPOINTS.PERSON_TASKS(name),
        {
            params: projectId ? { project_id: projectId } : undefined,
        }
    );
    return response.data;
}
