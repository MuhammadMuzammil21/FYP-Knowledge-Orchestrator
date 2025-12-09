'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X } from 'lucide-react';
import { useUpdateProject } from '@/hooks/useProjects';
import type { ProjectDetail } from '@/types';

interface ProjectHeaderProps {
    project: ProjectDetail;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || '');

    const updateProject = useUpdateProject();

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
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                {project.description && (
                    <p className="mt-2 text-gray-600">{project.description}</p>
                )}
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
            </Button>
        </div>
    );
}
