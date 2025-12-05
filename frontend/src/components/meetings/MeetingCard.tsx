import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import type { Meeting } from '@/types';
import { Calendar, Clock } from 'lucide-react';

interface MeetingCardProps {
    meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
    const formattedDate = new Date(meeting.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const formattedTime = new Date(meeting.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Link href={`/meetings/${meeting.meeting_id}`}>
            <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <h3 className="font-semibold">
                            {meeting.title || `Meeting ${meeting.meeting_id.slice(0, 8)}`}
                        </h3>
                        <StatusBadge status={meeting.status} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
