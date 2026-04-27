'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen } from 'lucide-react';
import { useProjectTasks } from '@/hooks/useTasks';
import { TaskListTable } from './TaskListTable';
import { LanguageBadge } from './TaskListTable';
import type { Task } from '@/types/task.types';

interface ProjectTaskBoardProps {
  projectId: number;
}

export function ProjectTaskBoard({ projectId }: ProjectTaskBoardProps) {
  const { data, isLoading, error } = useProjectTasks(projectId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card px-4 py-3 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Failed to load project tasks.</p>
      </div>
    );
  }

  const byMeeting = data?.by_meeting ?? {};
  const meetingIds = Object.keys(byMeeting);

  if (meetingIds.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-base mb-2">No tasks in this project</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Tasks will appear here after meetings are processed and insights are extracted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2" defaultValue={meetingIds.slice(0, 1)}>
      {meetingIds.map((meetingId) => {
        const meetingTasks: Task[] = byMeeting[meetingId] ?? [];
        // Get language from first task with a language value
        const language = meetingTasks.find((t) => t.language)?.language;

        return (
          <AccordionItem
            key={meetingId}
            value={meetingId}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground truncate">
                      Meeting
                    </span>
                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                      {meetingId}
                    </span>
                    <LanguageBadge language={language} />
                  </div>
                </div>
                <Badge variant="secondary" className="flex-shrink-0 ml-2 text-xs">
                  {meetingTasks.length} task{meetingTasks.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 border-t border-border/60">
              <div className="p-4">
                <TaskListTable tasks={meetingTasks} />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
