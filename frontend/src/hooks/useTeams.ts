import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTeams, getTeam, createTeam, updateTeam, deleteTeam,
    inviteMember, getInvites, revokeInvite, updateMemberRole, removeMember,
} from '@/lib/api/teams';
import type { CreateTeamRequest, InviteMemberRequest, TeamRole } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';

export function useTeams() {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const response = await getTeams();
            return response.teams;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useTeam(slug: string) {
    return useQuery({
        queryKey: ['team', slug],
        queryFn: () => getTeam(slug),
        enabled: !!slug,
        staleTime: 2 * 60 * 1000,
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTeamRequest) => createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team created successfully');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

export function useUpdateTeam(slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<CreateTeamRequest>) => updateTeam(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['team', slug] });
            toast.success('Team updated');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (slug: string) => deleteTeam(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team deleted');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

export function useInviteMember(slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InviteMemberRequest) => inviteMember(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-invites', slug] });
            toast.success('Invitation sent');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

export function useTeamInvites(slug: string) {
    return useQuery({
        queryKey: ['team-invites', slug],
        queryFn: async () => {
            const response = await getInvites(slug);
            return response.invites;
        },
        enabled: !!slug,
        staleTime: 60 * 1000,
    });
}

export function useRevokeInvite(slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (inviteId: string) => revokeInvite(slug, inviteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-invites', slug] });
            toast.success('Invite revoked');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

export function useUpdateMemberRole(slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: TeamRole }) =>
            updateMemberRole(slug, userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team', slug] });
            toast.success('Role updated');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

export function useRemoveMember(slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => removeMember(slug, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team', slug] });
            toast.success('Member removed');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}
