'use client';

import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder } from 'lucide-react';

export default function ProjectsPage() {
    const { data: projects, isLoading, error } = useProjects();

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-red-600">Error Loading Projects</h2>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Projects</h1>
                <p className="mt-2 text-gray-600">
                    Organize your meetings into projects for better insights
                </p>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            ) : projects && projects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                <Folder className="h-10 w-10 text-gray-400" />
                            </div>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-600">No Projects Yet</h2>
                        <p className="text-gray-500">
                            Projects are automatically created when you upload meetings
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
