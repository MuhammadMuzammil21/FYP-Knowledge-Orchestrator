'use client';

import { use } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TranscriptViewer } from '@/components/meetings/TranscriptViewer';
import { EntitiesPanel } from '@/components/meetings/EntitiesPanel';
import { ConflictsPanel } from '@/components/meetings/ConflictsPanel';
import { RAGSearch } from '@/components/meetings/RAGSearch';
import { ProgressBar } from '@/components/meetings/ProgressBar';
import { StatusBadge } from '@/components/meetings/StatusBadge';
import { useMeeting, useTranscript, useEntities } from '@/hooks/useMeetingDetail';
import { useMeetingStatus } from '@/hooks/useMeetingStatus';
import { useProjectConflicts } from '@/hooks/useKnowledgeGraph';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MeetingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function MeetingDetailPage({ params }: MeetingDetailPageProps) {
    const { id } = use(params);

    const { data: meeting, isLoading: meetingLoading } = useMeeting(id);
    const { data: status } = useMeetingStatus(id, true);
    const { data: transcriptData, isLoading: transcriptLoading } = useTranscript(id);
    const { data: entitiesData, isLoading: entitiesLoading } = useEntities(id);
    // Conflicts are now at project level
    const { data: conflictsData, isLoading: conflictsLoading } = useProjectConflicts(meeting?.projectId || '');

    if (meetingLoading) {
        return (
            <div className="h-full p-8">
                <Skeleton className="mb-4 h-8 w-64" />
                <Skeleton className="mb-8 h-4 w-96" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-gray-600">Meeting Not Found</h2>
                    <Link href="/meetings" className="text-blue-600 hover:underline">
                        Back to meetings
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(meeting.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="h-full overflow-y-auto p-8">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/meetings"
                    className="mb-4 inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to meetings
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold">
                            Meeting {meeting.id.slice(0, 8)}
                        </h1>
                        <p className="text-gray-600">{formattedDate}</p>
                    </div>
                    <StatusBadge status={meeting.status} />
                </div>
            </div>

            {/* Progress Bar */}
            {status && meeting.status === 'processing' && (
                <Card className="mb-6 p-4">
                    <ProgressBar status={status} />
                </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="transcript" className="h-[calc(100%-200px)]">
                <TabsList className="mb-4">
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="entities">Entities</TabsTrigger>
                    <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                    <TabsTrigger value="rag">RAG Search</TabsTrigger>
                </TabsList>

                {/* Transcript Tab */}
                <TabsContent value="transcript" className="h-full">
                    {transcriptLoading ? (
                        <Skeleton className="h-full" />
                    ) : transcriptData ? (
                        <TranscriptViewer
                            transcript={transcriptData.content}
                            isLlmRewritten={transcriptData.isLlmRewritten}
                        />
                    ) : (
                        <Card className="flex h-full items-center justify-center">
                            <p className="text-gray-500">
                                {meeting.status === 'completed'
                                    ? 'No transcript available'
                                    : 'Transcript will be available once processing is complete'}
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* Entities Tab */}
                <TabsContent value="entities" className="h-full overflow-y-auto">
                    {entitiesLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32" />
                            <Skeleton className="h-32" />
                            <Skeleton className="h-32" />
                        </div>
                    ) : entitiesData ? (
                        <EntitiesPanel entities={entitiesData} />
                    ) : (
                        <Card className="flex h-full items-center justify-center">
                            <p className="text-gray-500">
                                {meeting.status === 'completed'
                                    ? 'No entities extracted'
                                    : 'Entities will be available once processing is complete'}
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* Conflicts Tab */}
                <TabsContent value="conflicts" className="h-full overflow-y-auto">
                    {conflictsLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                        </div>
                    ) : conflictsData ? (
                        <ConflictsPanel conflicts={conflictsData} />
                    ) : (
                        <Card className="flex h-full items-center justify-center">
                            <p className="text-gray-500">
                                {meeting.status === 'completed'
                                    ? 'No conflicts detected'
                                    : 'Conflicts will be checked once processing is complete'}
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* RAG Search Tab */}
                <TabsContent value="rag" className="h-full overflow-y-auto">
                    {meeting.status === 'completed' ? (
                        <RAGSearch meetingId={id} />
                    ) : (
                        <Card className="flex h-full items-center justify-center">
                            <p className="text-gray-500">
                                RAG search will be available once processing is complete
                            </p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
