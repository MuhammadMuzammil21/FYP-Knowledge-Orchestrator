import { Progress } from '@/components/ui/progress';
import type { MeetingStatusDetail } from '@/types/domain.types';
import { STAGE_LABELS } from '@/lib/constants';

interface ProgressBarProps {
    status: MeetingStatusDetail;
}

export function ProgressBar({ status }: ProgressBarProps) {
    const stageLabel = STAGE_LABELS[status.stage] || status.stage;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{stageLabel}</span>
                <span className="text-muted-foreground">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2.5 bg-primary/20 dark:bg-primary/20" />
            {status.status === 'processing' && (
                <p className="text-xs text-muted-foreground">Processing in progress...</p>
            )}
        </div>
    );
}
