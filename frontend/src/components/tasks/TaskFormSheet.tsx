'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTask, useUpdateTask } from '@/hooks/useTaskMutations';
import type { Task, TaskStatus, TaskPriority } from '@/types/task.types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/task.types';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  description: z.string().min(1, 'Task description is required'),
  assignee_name: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
  meeting_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, form is in edit mode. Otherwise, create mode. */
  task?: Task;
  /** Required in create mode — pre-selected meeting */
  defaultMeetingId?: string;
}

export function TaskFormSheet({
  open,
  onOpenChange,
  task,
  defaultMeetingId,
}: TaskFormSheetProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: task?.description ?? '',
      assignee_name: task?.assignee_name ?? '',
      due_date: task?.due_date ?? '',
      status: (task?.status ?? 'pending') as TaskStatus,
      priority: (task?.priority ?? 'medium') as TaskPriority,
      notes: task?.notes ?? '',
      meeting_id: task?.meeting_id ?? defaultMeetingId ?? '',
    },
  });

  // Reset when task changes
  useEffect(() => {
    if (open) {
      reset({
        description: task?.description ?? '',
        assignee_name: task?.assignee_name ?? '',
        due_date: task?.due_date ?? '',
        status: (task?.status ?? 'pending') as TaskStatus,
        priority: (task?.priority ?? 'medium') as TaskPriority,
        notes: task?.notes ?? '',
        meeting_id: task?.meeting_id ?? defaultMeetingId ?? '',
      });
    }
  }, [open, task, defaultMeetingId, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit) {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: {
          description: values.description,
          assignee_name: values.assignee_name || null,
          due_date: values.due_date || null,
          status: values.status,
          priority: values.priority,
          notes: values.notes || null,
        },
      });
    } else {
      await createTask.mutateAsync({
        meeting_id: values.meeting_id || defaultMeetingId || '',
        description: values.description,
        assignee_name: values.assignee_name || null,
        due_date: values.due_date || null,
        status: values.status,
        priority: values.priority,
        notes: values.notes || null,
      });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{isEdit ? 'Edit Task' : 'New Task'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the task details below.'
              : 'Fill in the details to create a new task.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="task-description"
              rows={3}
              placeholder="What needs to be done?"
              {...register('description')}
              className={cn(errors.description && 'border-destructive')}
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Meeting ID (create mode) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="task-meeting-id">Meeting ID</Label>
              <Input
                id="task-meeting-id"
                placeholder="UUID of the meeting"
                {...register('meeting_id')}
              />
            </div>
          )}

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="task-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]).map(
                        ([v, label]) => (
                          <SelectItem key={v} value={v}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(TASK_PRIORITY_LABELS) as [TaskPriority, string][]).map(
                        ([v, label]) => (
                          <SelectItem key={v} value={v}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Assignee + Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Assignee name</Label>
              <Input
                id="task-assignee"
                placeholder="e.g. Ali"
                {...register('assignee_name')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                {...register('due_date')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              rows={2}
              placeholder="Additional context…"
              {...register('notes')}
            />
          </div>

          <SheetFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                ? 'Save changes'
                : 'Create task'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
