'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X, Trash2, Loader2 } from 'lucide-react';
import { useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { ProjectDetail } from '@/types';

interface ProjectHeaderProps {
    project: ProjectDetail;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || '');
    const router = useRouter();
    const { can } = useWorkspace();

    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();

    const handleSave = () => {
        updateProject.mutate(
            {
                projectId: project.id,
                data: {
                    name: name.trim(),
                    description: description.trim() || undefined,
                },
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                },
            }
        );
    };

    const handleCancel = () => {
        setName(project.name);
        setDescription(project.description || '');
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${project.name}"? This will permanently remove all meetings and data within it.`)) {
            deleteProject.mutate(project.id, {
                onSuccess: () => router.push('/projects'),
            });
        }
    };

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                        id="project-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter project name"
                        disabled={updateProject.isPending}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Input
                        id="project-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter project description"
                        disabled={updateProject.isPending}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || updateProject.isPending}
                        size="sm"
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={updateProject.isPending}
                        size="sm"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0">
            <div className="w-full sm:w-auto">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                {project.description && (
                    <p className="mt-2 text-muted-foreground">{project.description}</p>
                )}
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </Button>
                {can('delete_project') && (
                    <Button
                        onClick={handleDelete}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        disabled={deleteProject.isPending}
                    >
                        {deleteProject.isPending
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Trash2 className="mr-2 h-4 w-4" />
                        }
                        Delete
                    </Button>
                )}
            </div>
        </div>
    );
}
