import { Badge } from '@/components/ui/badge';
import type { MeetingStatus } from '@/types';
import { MEETING_STATUS_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
    status: MeetingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const colorClass = MEETING_STATUS_COLORS[status];

    return (
        <Badge className={colorClass} variant="secondary">
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
