import apiClient from './client';
import type {
    Team,
    TeamDetail,
    TeamInvite,
    CreateTeamRequest,
    InviteMemberRequest,
    TeamRole,
} from '@/types';

export async function getTeams(): Promise<Team[]> {
    const response = await apiClient.get<Team[]>('/api/teams');
    return response.data;
}

export async function getTeam(slug: string): Promise<TeamDetail> {
    const response = await apiClient.get<TeamDetail>(`/api/teams/${slug}`);
    return response.data;
}

export async function createTeam(data: CreateTeamRequest): Promise<Team> {
    const response = await apiClient.post<Team>('/api/teams', data);
    return response.data;
}

export async function updateTeam(slug: string, data: Partial<CreateTeamRequest>): Promise<Team> {
    const response = await apiClient.patch<Team>(`/api/teams/${slug}`, data);
    return response.data;
}

export async function deleteTeam(slug: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/teams/${slug}`);
    return response.data;
}

export async function inviteMember(slug: string, data: InviteMemberRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/api/teams/${slug}/invites`, data);
    return response.data;
}

export async function getInvites(slug: string): Promise<{ invites: TeamInvite[] }> {
    const response = await apiClient.get<{ invites: TeamInvite[] }>(`/api/teams/${slug}/invites`);
    return response.data;
}

export async function revokeInvite(slug: string, inviteId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/teams/${slug}/invites/${inviteId}`);
    return response.data;
}

export async function acceptInvite(token: string): Promise<{ message: string; team: Team }> {
    const response = await apiClient.post<{ message: string; team: Team }>('/api/teams/invites/accept', { token });
    return response.data;
}

export async function updateMemberRole(slug: string, userId: string, role: TeamRole): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`/api/teams/${slug}/members/${userId}`, { role });
    return response.data;
}

export async function removeMember(slug: string, userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/teams/${slug}/members/${userId}`);
    return response.data;
}

export interface TeamDashboard {
    projects_count: number;
    meetings_count: number;
}

export async function getTeamDashboard(slug: string): Promise<TeamDashboard> {
    const response = await apiClient.get<TeamDashboard>(`/api/teams/${slug}/dashboard`);
    return response.data;
}
