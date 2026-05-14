'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  UserPlus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Plus,
  Shield,
  Mic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus, TaskPriority } from '@/types/task.types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/task.types';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTaskMutations';
import { AssignTaskDialog } from './AssignTaskDialog';
import { TaskFormSheet } from './TaskFormSheet';

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const map: Record<TaskStatus, string> = {
    pending: 'bg-secondary text-secondary-foreground border-transparent',
    in_progress: 'bg-accent/20 text-accent-foreground border-accent/30',
    completed: 'bg-primary/15 text-primary border-primary/30',
  };
  return (
    <Badge className={cn('border text-xs font-medium', map[status], className)}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}

// ─── Priority Badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  const map: Record<TaskPriority, string> = {
    high: 'bg-destructive/15 text-destructive border-destructive/30',
    medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
    low: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800/40',
  };
  return (
    <Badge className={cn('border text-xs font-medium', map[priority], className)}>
      {TASK_PRIORITY_LABELS[priority]}
    </Badge>
  );
}

// ─── Language Badge ────────────────────────────────────────────────────────────

function LanguageBadge({ language }: { language?: string | null }) {
  if (!language) return null;
  const label = language === 'original' ? 'Raw ASR' : language.toUpperCase();
  return (
    <Badge
      className={cn(
        'border text-[10px] font-mono px-1.5 py-0',
        language === 'original'
          ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40'
          : 'bg-muted text-muted-foreground border-border'
      )}
    >
      {label}
    </Badge>
  );
}

// ─── Assignee Cell ─────────────────────────────────────────────────────────────

function AssigneeCell({
  task,
  onAssign,
}: {
  task: Task;
  onAssign: () => void;
}) {
  const { assignee_name, assignee_user_id, assignee_speaker_id } = task;

  if (!assignee_name && !assignee_user_id && !assignee_speaker_id) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground italic">— Unassigned —</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-1.5 text-xs text-primary hover:text-primary"
          onClick={onAssign}
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Assign
        </Button>
      </div>
    );
  }

  const name = assignee_name ?? 'Unknown';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarColor = assignee_user_id
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
    : assignee_speaker_id
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
    : 'bg-muted text-muted-foreground';

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarFallback className={cn('text-[10px] font-semibold', avatarColor)}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">{name}</p>
        {!assignee_user_id && assignee_speaker_id && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 dark:text-purple-400">
            <Mic className="h-2.5 w-2.5" />
            Voice ID
          </span>
        )}
        {!assignee_user_id && !assignee_speaker_id && assignee_name && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Shield className="h-2.5 w-2.5" />
            Unverified
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Row Expansion Detail ──────────────────────────────────────────────────────

function ExpandedRow({ task }: { task: Task }) {
  return (
    <div id={`expanded-panel-${task.id}`} role="region" className="px-4 py-3 bg-muted/30 border-t border-border/50 space-y-3 text-sm">
      {task.notes && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
          <p className="text-foreground text-sm">{task.notes}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Display name
          </p>
          <p className="text-xs text-foreground">{task.assignee_name ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            User ID
          </p>
          <p className="font-mono text-[11px] text-foreground truncate">{task.assignee_user_id ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Speaker ID (biometric)
          </p>
          <p className="font-mono text-[11px] text-foreground truncate">{task.assignee_speaker_id ?? '—'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {task.project_id && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">Project:</span>
            <span className="font-mono text-[11px]">{task.project_id}</span>
          </div>
        )}
        {task.meeting_id && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">Meeting:</span>
            <span className="font-mono text-[11px]">{task.meeting_id}</span>
          </div>
        )}
        <LanguageBadge language={task.language} />
      </div>
    </div>
  );
}

// ─── Inline Status / Priority Popover ─────────────────────────────────────────

function InlineStatusPopover({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const updateTask = useUpdateTask();

  const handleSelect = async (status: TaskStatus) => {
    setOpen(false);
    await updateTask.mutateAsync({ taskId: task.id, data: { status } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="focus:outline-none hover:opacity-80 transition-opacity">
          <StatusBadge status={task.status} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1" align="start">
        {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => handleSelect(s)}
            className={cn(
              'w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-accent transition-colors',
              task.status === s && 'bg-accent font-medium'
            )}
          >
            {TASK_STATUS_LABELS[s]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function InlinePriorityPopover({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const updateTask = useUpdateTask();

  const handleSelect = async (priority: TaskPriority) => {
    setOpen(false);
    await updateTask.mutateAsync({ taskId: task.id, data: { priority } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="focus:outline-none hover:opacity-80 transition-opacity">
          <PriorityBadge priority={task.priority} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-28 p-1" align="start">
        {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
          <button
            key={p}
            onClick={() => handleSelect(p)}
            className={cn(
              'w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-accent transition-colors',
              task.priority === p && 'bg-accent font-medium'
            )}
          >
            {TASK_PRIORITY_LABELS[p]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface TaskListTableProps {
  tasks?: Task[];
  isLoading?: boolean;
}

export function TaskListTable({ tasks = [], isLoading = false }: TaskListTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [assignDialogTask, setAssignDialogTask] = useState<Task | null>(null);
  const [editSheetTask, setEditSheetTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const deleteTask = useDeleteTask();

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmDelete = async () => {
    if (deleteTaskId === null) return;
    await deleteTask.mutateAsync(deleteTaskId);
    setDeleteTaskId(null);
  };

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <Skeleton className="h-4 w-6 flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20 flex-shrink-0" />
              <Skeleton className="h-5 w-16 flex-shrink-0" />
              <Skeleton className="h-5 w-16 flex-shrink-0" />
              <Skeleton className="h-4 w-20 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty State ──
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-base mb-2">No tasks found</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Tasks are extracted automatically from meeting transcripts, or you can create
            them manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Task</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-36">Assignee</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-24">Priority</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-28">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-24">Due Date</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task, idx) => (
              <React.Fragment key={task.id}>
                <tr
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRow(task.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Toggle details"
                        aria-expanded={expandedRows.has(task.id)}
                        aria-controls={`expanded-panel-${task.id}`}
                      >
                        {expandedRows.has(task.id) ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                      <span className="text-sm text-foreground line-clamp-2 leading-snug">
                        {task.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AssigneeCell task={task} onAssign={() => setAssignDialogTask(task)} />
                  </td>
                  <td className="px-4 py-3">
                    <InlinePriorityPopover task={task} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineStatusPopover task={task} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {task.due_date ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <TaskActionsMenu
                      task={task}
                      onAssign={() => setAssignDialogTask(task)}
                      onEdit={() => setEditSheetTask(task)}
                      onDelete={() => setDeleteTaskId(task.id)}
                    />
                  </td>
                </tr>
                {expandedRows.has(task.id) && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <ExpandedRow task={task} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug flex-1">{task.description}</p>
              <TaskActionsMenu
                task={task}
                onAssign={() => setAssignDialogTask(task)}
                onEdit={() => setEditSheetTask(task)}
                onDelete={() => setDeleteTaskId(task.id)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <InlineStatusPopover task={task} />
              <InlinePriorityPopover task={task} />
              {task.due_date && (
                <span className="text-xs text-muted-foreground">{task.due_date}</span>
              )}
            </div>
            <AssigneeCell task={task} onAssign={() => setAssignDialogTask(task)} />
            <button
              onClick={() => toggleRow(task.id)}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
              aria-expanded={expandedRows.has(task.id)}
              aria-controls={`expanded-panel-${task.id}`}
            >
              {expandedRows.has(task.id) ? (
                <>
                  <ChevronUp className="h-3 w-3" /> Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" /> Show details
                </>
              )}
            </button>
            {expandedRows.has(task.id) && <ExpandedRow task={task} />}
          </div>
        ))}
      </div>

      {/* Dialogs */}
      {assignDialogTask && (
        <AssignTaskDialog
          open={!!assignDialogTask}
          onOpenChange={(open) => !open && setAssignDialogTask(null)}
          taskId={assignDialogTask.id}
          taskDescription={assignDialogTask.description}
        />
      )}

      {editSheetTask && (
        <TaskFormSheet
          open={!!editSheetTask}
          onOpenChange={(open) => !open && setEditSheetTask(null)}
          task={editSheetTask}
        />
      )}

      <AlertDialog open={deleteTaskId !== null} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Actions Menu ──────────────────────────────────────────────────────────────

function TaskActionsMenu({
  task,
  onAssign,
  onEdit,
  onDelete,
}: {
  task: Task;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Task actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onAssign} className="gap-2 text-sm">
          <UserPlus className="h-4 w-4" />
          Assign to user
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-2 text-sm">
          <Pencil className="h-4 w-4" />
          Edit task
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-sm text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Re-export badges for reuse in Kanban
export { StatusBadge, PriorityBadge, LanguageBadge };
