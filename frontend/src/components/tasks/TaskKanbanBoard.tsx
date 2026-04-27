'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, GripVertical, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types/task.types';
import { TASK_STATUS_LABELS } from '@/types/task.types';
import { useUpdateTask } from '@/hooks/useTaskMutations';
import { PriorityBadge } from './TaskListTable';

const TODAY = new Date().toISOString().split('T')[0];

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

// ─── Kanban Card ───────────────────────────────────────────────────────────────

function KanbanCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const isToday = task.due_date === TODAY;
  const isPast = task.due_date && task.due_date < TODAY && task.status !== 'completed';

  const dueLabel = useMemo(() => {
    if (!task.due_date) return null;
    try {
      const d = new Date(task.due_date + 'T00:00:00');
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return task.due_date;
    }
  }, [task.due_date]);

  const assigneeName = task.assignee_name ?? null;
  const initials = assigneeName
    ? assigneeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <div
      className={cn(
        'bg-card rounded-lg border p-3 space-y-2.5 shadow-soft cursor-grab active:cursor-grabbing select-none',
        isToday && 'ring-2 ring-amber-400 animate-pulse',
        isDragging && 'opacity-50 ring-2 ring-primary',
        'transition-shadow hover:shadow-md'
      )}
    >
      {/* Title */}
      <p className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
        {task.description}
      </p>

      {/* Priority */}
      <PriorityBadge priority={task.priority} />

      {/* Assignee */}
      {assigneeName && (
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5 flex-shrink-0">
            <AvatarFallback className="text-[9px] font-semibold bg-primary/15 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{assigneeName}</span>
        </div>
      )}

      {/* Due date */}
      {dueLabel && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs',
            isPast ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="capitalize">{dueLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Sortable Card Wrapper ─────────────────────────────────────────────────────

function SortableCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard task={task} isDragging={isDragging} />
    </div>
  );
}

// ─── Droppable Column ──────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  label,
  tasks,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}) {
  const colColors: Record<TaskStatus, string> = {
    pending: 'border-t-muted-foreground/30',
    in_progress: 'border-t-accent',
    completed: 'border-t-primary',
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border border-t-4 bg-muted/20 min-w-[260px] snap-start',
        colColors[status]
      )}
      style={{ minHeight: '200px' }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <Badge variant="secondary" className="text-xs font-medium">
          {tasks.length}
        </Badge>
      </div>

      {/* Task list */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No tasks</p>
            </div>
          ) : (
            tasks.map((task) => <SortableCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Main Board ────────────────────────────────────────────────────────────────

interface TaskKanbanBoardProps {
  tasks?: Task[];
  isLoading?: boolean;
}

export function TaskKanbanBoard({ tasks = [], isLoading = false }: TaskKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Group tasks by status
  const columns = useMemo<Record<TaskStatus, Task[]>>(() => {
    const map: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      completed: [],
    };
    for (const t of tasks) {
      const key = t.status in map ? t.status : 'pending';
      map[key].push(t);
    }
    return map;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const found = tasks.find((t) => t.id === event.active.id);
    setActiveTask(found ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    // Determine the target column: over.id is either a task id or a column id
    const overId = over.id as TaskStatus | number;
    let targetStatus: TaskStatus | undefined;

    // Check if dropped over a column id directly
    if (COLUMNS.some((c) => c.id === overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      // Dropped over a task — find what column that task is in
      const overTask = tasks.find((t) => t.id === overId);
      targetStatus = overTask?.status;
    }

    if (!targetStatus) return;

    const sourceTask = tasks.find((t) => t.id === active.id);
    if (!sourceTask || sourceTask.status === targetStatus) return;

    // Optimistic update + API call
    await updateTask.mutateAsync({
      taskId: sourceTask.id,
      data: { status: targetStatus },
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="min-w-[260px] snap-start rounded-xl border border-border bg-muted/20 p-3 space-y-2"
          >
            <Skeleton className="h-5 w-24 mb-3" />
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            status={col.id}
            label={col.label}
            tasks={columns[col.id]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
