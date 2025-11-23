'use client';

import { CheckCircle2, Loader2, AlertCircle, Upload, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '../../../src/lib/utils/cn';
import type { ProcessingStatus } from '../../../src/types';

interface ProcessingStatusIndicatorProps {
  status: ProcessingStatus;
  className?: string;
}

const STAGE_CONFIG = {
  uploading: {
    label: 'Uploading',
    icon: Upload,
    description: 'Uploading audio file...',
  },
  transcribing: {
    label: 'Transcribing',
    icon: FileText,
    description: 'Converting speech to text...',
  },
  extracting: {
    label: 'Extracting',
    icon: Sparkles,
    description: 'Extracting tasks, decisions, and key points...',
  },
  complete: {
    label: 'Complete',
    icon: CheckCircle2,
    description: 'Processing complete!',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    description: 'Processing failed. Please try again.',
  },
} as const;

export function ProcessingStatusIndicator({ status, className }: ProcessingStatusIndicatorProps) {
  const stages = [
    { key: 'uploading' as const, ...STAGE_CONFIG.uploading },
    { key: 'transcribing' as const, ...STAGE_CONFIG.transcribing },
    { key: 'extracting' as const, ...STAGE_CONFIG.extracting },
    { key: 'complete' as const, ...STAGE_CONFIG.complete },
  ];

  const getStageStatus = (stageKey: keyof typeof STAGE_CONFIG) => {
    const stageInfo = status.stages[stageKey];
    const isCurrent = stageInfo.current;
    const isCompleted = stageInfo.completed;

    if (status.stage === 'failed' && stageKey !== 'failed') {
      return 'pending';
    }

    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    return 'pending';
  };

  const getStageIcon = (stageKey: keyof typeof STAGE_CONFIG, stageStatus: string) => {
    const Icon = STAGE_CONFIG[stageKey].icon;

    if (stageStatus === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }

    if (stageStatus === 'current') {
      if (status.stage === 'failed') {
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      }
      return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    }

    return <Icon className="h-5 w-5 text-muted-foreground" />;
  };

  const currentStageConfig = STAGE_CONFIG[status.stage] || STAGE_CONFIG.complete;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Processing Status</CardTitle>
          <Badge
            variant={
              status.status === 'complete'
                ? 'default'
                : status.status === 'failed'
                ? 'destructive'
                : 'secondary'
            }
          >
            {status.progress}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{currentStageConfig.description}</span>
            <span className="font-medium">{status.progress}%</span>
          </div>
          <Progress
            value={status.progress}
            className={cn(
              status.status === 'failed' && 'bg-destructive',
              status.status === 'complete' && 'bg-green-500'
            )}
          />
        </div>

        {/* Stage Timeline with Individual Progress Bars */}
        <div className="relative space-y-4 pt-2">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(stage.key);
            const isLast = index === stages.length - 1;
            const stageInfo = status.stages[stage.key];
            const stageProgress = stageInfo.progress ?? (stageStatus === 'completed' ? 100 : 0);

            return (
              <div key={stage.key} className="relative">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5 relative z-10">
                    <div className="bg-background rounded-full p-0.5">
                      {getStageIcon(stage.key, stageStatus)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            stageStatus === 'completed' && 'text-green-600 dark:text-green-400',
                            stageStatus === 'current' && 'text-primary',
                            stageStatus === 'pending' && 'text-muted-foreground'
                          )}
                        >
                          {stage.label}
                        </span>
                        {stageStatus === 'current' && status.status !== 'failed' && (
                          <Badge variant="outline" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      {(stageStatus === 'current' || stageStatus === 'completed') && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {stageProgress}%
                        </span>
                      )}
                    </div>

                    {/* Individual Stage Progress Bar */}
                    {(stageStatus === 'current' || stageStatus === 'completed') && (
                      <div className="space-y-1">
                        <Progress
                          value={stageProgress}
                          className={cn(
                            'h-1.5',
                            stageStatus === 'completed' && 'bg-green-500',
                            stageStatus === 'current' && status.status === 'failed' && 'bg-destructive'
                          )}
                        />
                        {stageStatus === 'current' && (
                          <p className="text-xs text-muted-foreground">{stage.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-[11px] top-10 w-0.5 h-6',
                      stageStatus === 'completed'
                        ? 'bg-green-500'
                        : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {status.status === 'failed' && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Processing failed. Please try uploading the file again or contact support if the
              issue persists.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

