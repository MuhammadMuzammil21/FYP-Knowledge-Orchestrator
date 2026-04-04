import { cn } from '@/lib/utils';
import type { MeetingStatus } from '@/types';

interface StatusBadgeProps {
  status: MeetingStatus;
  size?: 'sm' | 'default';
}

const statusConfig: Record<
  MeetingStatus,
  {
    dot: string;
    container: string;
    label: string;
    text: string;
  }
> = {
  queued: {
    dot: 'bg-accent',
    container: 'bg-accent/15 border border-accent/40 dark:bg-accent/10 dark:border-accent/20',
    label: 'Queued',
    text: 'text-accent dark:text-accent',
  },
  processing: {
    dot: 'bg-primary animate-pulse',
    container: 'bg-primary/15 border border-primary/40 dark:bg-primary/10 dark:border-primary/20',
    label: 'Processing',
    text: 'text-primary dark:text-primary',
  },
  completed: {
    dot: 'bg-accent',
    container: 'bg-accent/15 border border-accent/40 dark:bg-accent/10 dark:border-accent/20',
    label: 'Completed',
    text: 'text-accent dark:text-accent',
  },
  error: {
    dot: 'bg-destructive',
    container:
      'bg-destructive/15 border border-destructive/40 dark:bg-destructive/10 dark:border-destructive/20',
    label: 'Error',
    text: 'text-destructive dark:text-destructive',
  },
};

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.error;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.container,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('rounded-full flex-shrink-0', config.dot, 'h-1.5 w-1.5')} />
      {config.label}
    </span>
  );
}
