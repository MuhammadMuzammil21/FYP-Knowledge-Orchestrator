import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import type { Meeting } from '@/types/domain.types';
import { Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils/date';

interface MeetingCardProps {
    meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
    const formattedDate = formatDate(meeting.createdAt);
    const formattedTime = formatTime(meeting.createdAt);

    return (
        <Link href={`/meetings/${meeting.id}`}>
            <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <h3 className="font-semibold">
                            {meeting.title || `Meeting ${meeting.id.slice(0, 8)}`}
                        </h3>
                        <StatusBadge status={meeting.status} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formattedDate}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formattedTime}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
