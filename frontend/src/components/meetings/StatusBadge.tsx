import { cn } from '@/lib/utils'
import type { MeetingStatus } from '@/types'

interface StatusBadgeProps {
  status: MeetingStatus
  size?: 'sm' | 'default'
}

const statusConfig: Record<
  MeetingStatus,
  {
    dot: string
    container: string
    label: string
    text: string
  }
> = {
  queued: {
    dot: 'bg-amber-400',
    container: 'bg-amber-400/10 border border-amber-400/20',
    label: 'Queued',
    text: 'text-amber-600 dark:text-amber-400',
  },
  processing: {
    dot: 'bg-blue-400 animate-pulse',
    container: 'bg-blue-400/10 border border-blue-400/20',
    label: 'Processing',
    text: 'text-blue-600 dark:text-blue-400',
  },
  completed: {
    dot: 'bg-green-400',
    container: 'bg-green-400/10 border border-green-400/20',
    label: 'Completed',
    text: 'text-green-600 dark:text-green-400',
  },
  error: {
    dot: 'bg-red-400',
    container: 'bg-red-400/10 border border-red-400/20',
    label: 'Error',
    text: 'text-red-600 dark:text-red-400',
  },
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.error

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.container,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          config.dot,
          'h-1.5 w-1.5'
        )}
      />
      {config.label}
    </span>
  )
}
