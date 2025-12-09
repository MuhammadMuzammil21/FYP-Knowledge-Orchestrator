import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Folder, Calendar, FileText } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const formattedDate = new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <Link href={`/projects/${project.id}`}>
            <Card className="p-6 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                            <Folder className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            {project.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{project.meeting_count} meetings</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formattedDate}</span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
