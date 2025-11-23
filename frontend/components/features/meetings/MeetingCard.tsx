'use client';

import { useRouter } from 'next/navigation';
import { Clock, Users, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatDuration } from '../../../src/lib/utils/formatters';
import { cn } from '../../../src/lib/utils/cn';
import type { Meeting } from '../../../src/types';
import { useMeetingStatus } from '../../../src/lib/hooks/useMeetings';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const router = useRouter();
  
  // Get real-time status if processing
  const { data: processingStatus } = useMeetingStatus(
    meeting.id,
    meeting.status === 'processing'
  );

  const handleClick = () => {
    if (meeting.status === 'complete') {
      router.push(`/meetings/${meeting.id}`);
    }
  };

  const getStatusIcon = () => {
    switch (meeting.status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (meeting.status) {
      case 'complete':
        return <Badge variant="default">Complete</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all",
        meeting.status === 'complete'
          ? "hover:shadow-md hover:border-primary cursor-pointer"
          : "opacity-75 cursor-default"
      )}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-semibold text-lg leading-tight flex-1">
          {meeting.title}
        </h3>
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDate(meeting.uploadDate)}</span>
        </div>

        {meeting.duration > 0 && (
          <div className="flex items-center gap-1.5">
            <span>{formatDuration(meeting.duration)}</span>
          </div>
        )}

        {meeting.speakerCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{meeting.speakerCount} speaker{meeting.speakerCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Status Badge and Progress */}
      <div className="space-y-2">
        {meeting.status === 'processing' && processingStatus && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{processingStatus.stage}</span>
              <span>{processingStatus.progress}%</span>
            </div>
            <Progress value={processingStatus.progress} className="h-1.5" />
          </div>
        )}
        <div className="flex items-center justify-end">
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
}