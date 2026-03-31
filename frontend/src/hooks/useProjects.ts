import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, getProject, updateProject, getProjectGraph, deleteProject } from '@/lib/api/projects';
import type { Project, ProjectDetail, UpdateProjectRequest, ProjectGraphResponse } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';

/**
 * Hook to fetch all projects for the current user
 */
export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await getProjects();
            return response.projects; // Extract projects array
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch a single project with its meetings
 */
export function useProject(projectId: string) {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId),
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) =>
            updateProject(projectId, data),
        onSuccess: (updatedProject, { projectId }) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });

            // Update cache optimistically
            queryClient.setQueryData(['project', projectId], updatedProject);

            toast.success('Project updated successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}

/**
 * Hook to fetch project knowledge graph
 */
export function useProjectGraph(projectId: string) {
    return useQuery({
        queryKey: ['project-graph', projectId],
        queryFn: () => getProjectGraph(projectId),
        enabled: !!projectId,
        staleTime: 10 * 60 * 1000, // 10 minutes (graphs are expensive to compute)
    });
}

/**
 * Hook to delete a project (owner/admin only)
 */
export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) => deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project deleted successfully');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
