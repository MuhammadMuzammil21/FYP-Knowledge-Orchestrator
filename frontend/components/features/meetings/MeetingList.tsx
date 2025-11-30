'use client';

import { useState } from 'react';
import { useMeetings } from '../../../src/lib/hooks/useMeetings';
import { MeetingCard } from './MeetingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export function MeetingList() {
    const [page, setPage] = useState(0);
    const { data: meetings, isLoading, isError, error, refetch } = useMeetings(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleNextPage = () => {
        if (meetings && meetings.length === ITEMS_PER_PAGE) {
            setPage(p => p + 1);
        }
    };

    const handlePrevPage = () => {
        setPage(p => Math.max(0, p - 1));
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Meetings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <MeetingCardSkeleton key={i} />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Failed to load meetings</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error?.message || 'Something went wrong'}
                        </p>
                        <Button onClick={() => refetch()} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!meetings || (meetings.length === 0 && page === 0)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-3 mb-4">
                            <svg
                                className="h-6 w-6 text-muted-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No meetings yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Upload your first meeting recording to get started with AI-powered transcription and insights
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>My Meetings</CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {meetings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No more meetings found.
                    </div>
                ) : (
                    meetings.map((meeting) => (
                        <MeetingCard key={meeting.id} meeting={meeting} />
                    ))
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={page === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page + 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={meetings.length < ITEMS_PER_PAGE}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function MeetingCardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-5 w-20" />
        </div>
    );
}
