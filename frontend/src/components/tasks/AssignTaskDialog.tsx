'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAssignTask } from '@/hooks/useTaskMutations';
import { UserCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  taskDescription: string;
}

export function AssignTaskDialog({
  open,
  onOpenChange,
  taskId,
  taskDescription,
}: AssignTaskDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const assignTask = useAssignTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    setSuccess(false);
    try {
      await assignTask.mutateAsync({ taskId, data: { email: values.email } });
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        reset();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? err?.message ?? 'Failed to assign task';
      setApiError(typeof msg === 'string' ? msg : 'User not found');
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      reset();
      setApiError(null);
      setSuccess(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Assign Task
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground line-clamp-2">
            {taskDescription}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Task assigned successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="assign-email">User email</Label>
              <Input
                id="assign-email"
                type="email"
                placeholder="user@example.com"
                autoComplete="off"
                {...register('email')}
                className={cn(errors.email && 'border-destructive focus-visible:ring-destructive/30')}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {apiError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {apiError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Assigning…' : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
