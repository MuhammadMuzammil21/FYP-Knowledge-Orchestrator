'use client';

import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConflicts } from '../../../src/lib/hooks/useMeetings';
import { Skeleton } from '@/components/ui/skeleton';

interface ConflictListProps {
    meetingId: string;
}

export function ConflictList({ meetingId }: ConflictListProps) {
    const { data: conflictResponse, isLoading } = useConflicts(meetingId);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    const conflicts = conflictResponse?.conflicts || [];

    if (conflicts.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <div className="flex justify-center mb-2">
                    <AlertTriangle className="h-8 w-8 opacity-20" />
                </div>
                <p>No conflicts detected</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {conflicts.map((conflict, index) => (
                <Card key={index} className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm">{conflict.type}</h4>
                                    {conflict.severity && (
                                        <Badge variant={conflict.severity === 'high' ? 'destructive' : 'secondary'}>
                                            {conflict.severity}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {conflict.description}
                                </p>
                                {conflict.related_meeting_id && (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <a href={`/meetings/${conflict.related_meeting_id}`}>
                                            View Related Meeting <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
