'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  ChevronDown,
  List,
  LayoutGrid,
  Users,
  ClipboardList,
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useRematchSpeakers } from '@/hooks/useTaskMutations';
import { DailyReminderBanner } from '@/components/tasks/DailyReminderBanner';
import { TaskListTable } from '@/components/tasks/TaskListTable';
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard';
import { TaskFormSheet } from '@/components/tasks/TaskFormSheet';
import type { TaskFilters, TaskStatus, TaskPriority } from '@/types/task.types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/task.types';

type ViewMode = 'list' | 'board';

export default function TasksPage() {
  // ── Filters ──
  const [status, setStatus] = useState<TaskStatus | 'all'>('all');
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all');
  const [assigneeName, setAssigneeName] = useState('');
  const [meetingIdFilter, setMeetingIdFilter] = useState('');

  // ── View mode ──
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // ── Dialogs ──
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [rematchDialog, setRematchDialog] = useState<false | 'soft' | 'force'>(false);

  // ── Build filters ──
  const filters: TaskFilters = useMemo(() => {
    const f: TaskFilters = {};
    if (status !== 'all') f.status = status;
    if (priority !== 'all') f.priority = priority;
    if (assigneeName.trim()) f.assignee_name = assigneeName.trim();
    if (meetingIdFilter.trim()) f.meeting_id = meetingIdFilter.trim();
    return f;
  }, [status, priority, assigneeName, meetingIdFilter]);

  const { data: tasks = [], isLoading } = useTasks(filters);
  const rematchSpeakers = useRematchSpeakers();

  // ── Summary stats ──
  const meetingCount = useMemo(
    () => new Set(tasks.map((t) => t.meeting_id).filter(Boolean)).size,
    [tasks]
  );

  const handleRematch = async (force: boolean) => {
    const meetingId = meetingIdFilter.trim();
    if (!meetingId) return;
    setRematchDialog(false);
    await rematchSpeakers.mutateAsync({ meetingId, force });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-4">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Tasks
          </h1>
          {isLoading ? (
            <Skeleton className="h-3.5 w-40 mt-1" />
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              {meetingCount > 0 ? ` across ${meetingCount} meeting${meetingCount !== 1 ? 's' : ''}` : ''}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" className="gap-2" onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>

          {/* Rematch Speakers — only enabled when a meeting filter is active */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!meetingIdFilter.trim()}
                className="gap-1.5"
                title={
                  !meetingIdFilter.trim()
                    ? 'Filter by a meeting ID to enable speaker rematch'
                    : undefined
                }
              >
                <Users className="h-4 w-4" />
                Rematch Speakers
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => setRematchDialog('soft')}
                className="text-sm gap-2"
              >
                Rematch unmatched only
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setRematchDialog('force')}
                className="text-sm gap-2 text-destructive focus:text-destructive"
              >
                Force rematch all speakers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status */}
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as TaskStatus | 'all')}
        >
          <SelectTrigger id="filter-status" className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select
          value={priority}
          onValueChange={(v) => setPriority(v as TaskPriority | 'all')}
        >
          <SelectTrigger id="filter-priority" className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(Object.entries(TASK_PRIORITY_LABELS) as [TaskPriority, string][]).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee search */}
        <Input
          id="filter-assignee"
          placeholder="Assignee name…"
          value={assigneeName}
          onChange={(e) => setAssigneeName(e.target.value)}
          className="h-8 w-[160px] text-xs"
        />

        {/* Meeting ID filter */}
        <Input
          id="filter-meeting"
          placeholder="Meeting ID…"
          value={meetingIdFilter}
          onChange={(e) => setMeetingIdFilter(e.target.value)}
          className="h-8 w-[200px] text-xs font-mono"
        />

        {/* View toggle (desktop) */}
        <div className="ml-auto">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="gap-1.5 text-xs px-3">
                <List className="h-3.5 w-3.5" />
                List
              </TabsTrigger>
              <TabsTrigger value="board" className="gap-1.5 text-xs px-3">
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Daily Reminder Banner ── */}
      <DailyReminderBanner tasks={tasks} />

      {/* ── Main Content ── */}
      {viewMode === 'list' ? (
        <TaskListTable tasks={tasks} isLoading={isLoading} />
      ) : (
        <TaskKanbanBoard tasks={tasks} isLoading={isLoading} />
      )}

      {/* ── New Task Sheet ── */}
      <TaskFormSheet
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        defaultMeetingId={meetingIdFilter.trim() || undefined}
      />

      {/* ── Soft Rematch Confirm ── */}
      <AlertDialog
        open={rematchDialog === 'soft'}
        onOpenChange={(open) => !open && setRematchDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rematch unmatched speakers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will re-run biometric speaker matching for speakers that haven&apos;t been
              matched yet in this meeting. Already-matched speakers will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRematch(false)}>
              Rematch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Force Rematch Confirm ── */}
      <AlertDialog
        open={rematchDialog === 'force'}
        onOpenChange={(open) => !open && setRematchDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Force rematch all speakers?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Warning:</strong> This will re-evaluate ALL speaker assignments across this
              meeting, including already-matched ones. Only do this after updating a voice profile.
              Incorrect matches may be reset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRematch(true)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Force Rematch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
