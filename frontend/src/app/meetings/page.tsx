'use client';

import { useState } from 'react';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMeetings } from '@/hooks/useMeetings';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGINATION_DEFAULTS } from '@/lib/constants';

export default function MeetingsPage() {
    const [offset, setOffset] = useState(0);
    const limit = PAGINATION_DEFAULTS.LIMIT;

    const { data, isLoading, error } = useMeetings({ limit, offset });

    const handlePrevious = () => {
        setOffset(Math.max(0, offset - limit));
    };

    const handleNext = () => {
        setOffset(offset + limit);
    };

    const hasPrevious = offset > 0;
    const hasNext = data?.meetings && data.meetings.length === limit;

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-red-600">Error Loading Meetings</h2>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Meetings</h1>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            ) : data?.meetings && data.meetings.length > 0 ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.meetings.map((meeting) => (
                            <MeetingCard key={meeting.meeting_id} meeting={meeting} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={!hasPrevious}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                            Showing {offset + 1} - {offset + (data?.meetings?.length || 0)}
                        </span>
                        <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={!hasNext}
                        >
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold text-gray-600">No Meetings Yet</h2>
                        <p className="text-gray-500">Upload your first meeting to get started</p>
                    </div>
                </div>
            )}
        </div>
    );
}
