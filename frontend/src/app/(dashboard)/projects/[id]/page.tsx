'use client';

import { use } from 'react';
import Link from 'next/link';
import { useProject } from '@/hooks/useProjects';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Network } from 'lucide-react';
import { formatLongDate } from '@/lib/utils/date';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const { data: project, isLoading, error } = useProject(id);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-destructive">Error Loading Project</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full p-8">
        <Skeleton className="mb-6 h-20 w-full" />
        <Skeleton className="mb-4 h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-muted-foreground">Project Not Found</h2>
          <p className="text-muted-foreground/70">The project you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-8">
      <ProjectHeader project={project} />

      {/* Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link href={`/projects/${id}/conflicts`}>
          <Button variant="outline" className="w-full sm:w-auto">
            <AlertTriangle className="mr-2 h-4 w-4" />
            View Conflicts
          </Button>
        </Link>
        <Link href={`/projects/${id}/graph`}>
          <Button variant="outline" className="w-full sm:w-auto">
            <Network className="mr-2 h-4 w-4" />
            Knowledge Graph
          </Button>
        </Link>
      </div>

      {/* Project Stats */}
      <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Meetings</div>
          <div className="mt-1 text-3xl font-bold">{project.meetings?.length ?? project.meeting_count ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Created</div>
          <div className="mt-1 text-lg font-semibold">{formatLongDate(project.created_at)}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Last Updated</div>
          <div className="mt-1 text-lg font-semibold">{formatLongDate(project.updated_at)}</div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl md:text-2xl font-bold">Meetings in this Project</h2>
        {project.meetings && project.meetings.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {project.meetings.map((meeting) => {
              // Transform API Meeting to domain Meeting
              const domainMeeting = {
                id: meeting.meeting_id,
                title: meeting.title,
                status: meeting.status,
                createdAt: new Date(meeting.created_at),
              };
              return <MeetingCard key={meeting.meeting_id} meeting={domainMeeting} />;
            })}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
            <p className="text-muted-foreground">No meetings in this project yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
