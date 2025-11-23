'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '../../../src/lib/utils/cn';
import type { ProcessingStatus } from '../../../src/types';

interface CompactProgressBarProps {
  status: ProcessingStatus;
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function CompactProgressBar({
  status,
  className,
  showPercentage = true,
  size = 'md',
}: CompactProgressBarProps) {
  const isComplete = status.status === 'complete';
  const isFailed = status.status === 'failed';
  const isProcessing = status.status === 'processing';

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {isComplete
            ? 'Complete'
            : isFailed
            ? 'Failed'
            : isProcessing
            ? `Processing: ${status.stage}`
            : 'Pending'}
        </span>
        {showPercentage && (
          <Badge
            variant={
              isComplete ? 'default' : isFailed ? 'destructive' : 'secondary'
            }
            className="text-xs"
          >
            {status.progress}%
          </Badge>
        )}
      </div>
      <Progress
        value={status.progress}
        className={cn(
          SIZE_CLASSES[size],
          isComplete && 'bg-green-500',
          isFailed && 'bg-destructive'
        )}
      />
    </div>
  );
}

