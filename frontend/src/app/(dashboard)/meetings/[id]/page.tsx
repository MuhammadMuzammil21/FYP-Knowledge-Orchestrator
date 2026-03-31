'use client';

import { use } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TranscriptViewer } from '@/components/meetings/TranscriptViewer';
import { EntitiesPanel } from '@/components/meetings/EntitiesPanel';
import { ConflictsPanel } from '@/components/meetings/ConflictsPanel';
import { RAGChat } from '@/components/meetings/RAGChat';
import { ProgressBar } from '@/components/meetings/ProgressBar';
import { StatusBadge } from '@/components/meetings/StatusBadge';
import { SpeakersPanel } from '@/components/speakers/SpeakersPanel';
import { useMeeting, useTranscript, useEntities, useDeleteMeeting } from '@/hooks/useMeetingDetail';
import { useMeetingStatus } from '@/hooks/useMeetingStatus';
import { useProjectConflicts } from '@/hooks/useKnowledgeGraph';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { ArrowLeft, Network, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/utils/date';

interface MeetingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function MeetingDetailPage({ params }: MeetingDetailPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { can } = useWorkspace();

    const { data: meeting, isLoading: meetingLoading } = useMeeting(id);
    const { data: status } = useMeetingStatus(id, true);
    const { data: transcriptData, isLoading: transcriptLoading } = useTranscript(id);
    const { data: entitiesData, isLoading: entitiesLoading } = useEntities(id);
    // Conflicts are now at project level
    const { data: conflictsData, isLoading: conflictsLoading } = useProjectConflicts(meeting?.projectId || '');
    const deleteMeeting = useDeleteMeeting();

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
                    <h2 className="mb-2 text-2xl font-bold text-muted-foreground">Meeting Not Found</h2>
                    <Link href="/meetings" className="text-primary hover:underline">
                        Back to meetings
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = formatDateTime(meeting.createdAt);

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/meetings"
                    className="mb-4 inline-flex items-center text-sm text-primary hover:underline"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to meetings
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="mb-2 text-2xl md:text-3xl font-bold">
                            Meeting {meeting.id.slice(0, 8)}
                        </h1>
                        <p className="text-muted-foreground">{formattedDate}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {meeting.status === 'completed' && (
                            <Link href={`/meetings/${id}/graph`}>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Network className="mr-2 h-4 w-4" />
                                    View Graph
                                </Button>
                            </Link>
                        )}
                        {can('delete_meeting') && (
                            <Button
                                variant="outline"
                                size="default"
                                className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
                                disabled={deleteMeeting.isPending}
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
                                        deleteMeeting.mutate(id, {
                                            onSuccess: () => router.push('/meetings'),
                                        });
                                    }
                                }}
                            >
                                {deleteMeeting.isPending
                                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    : <Trash2 className="mr-2 h-4 w-4" />
                                }
                                Delete
                            </Button>
                        )}
                        <StatusBadge status={meeting.status} />
                    </div>
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
                <TabsList className="mb-4" style={{ display: 'flex', width: '100%', height: 'auto', padding: '4px' }}>
                    <TabsTrigger value="transcript" style={{ flex: 1 }}>Transcript</TabsTrigger>
                    <TabsTrigger value="entities" style={{ flex: 1 }}>Entities</TabsTrigger>
                    <TabsTrigger value="speakers" style={{ flex: 1 }}>Speakers</TabsTrigger>
                    <TabsTrigger value="conflicts" style={{ flex: 1 }}>Conflicts</TabsTrigger>
                    <TabsTrigger value="rag" style={{ flex: 1 }}>Chat</TabsTrigger>
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
                            <p className="text-muted-foreground/70">
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
                            <p className="text-muted-foreground/70">
                                {meeting.status === 'completed'
                                    ? 'No entities extracted'
                                    : 'Entities will be available once processing is complete'}
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* Speakers Tab */}
                <TabsContent value="speakers" className="h-full overflow-y-auto">
                    {meeting.status === 'completed' ? (
                        <SpeakersPanel meetingId={id} />
                    ) : (
                        <Card className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground/70">
                                Speakers will be available once processing is complete
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
                            <p className="text-muted-foreground/70">
                                {meeting.status === 'completed'
                                    ? 'No conflicts detected'
                                    : 'Conflicts will be checked once processing is complete'}
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* RAG Chat Tab */}
                <TabsContent value="rag" className="h-full">
                    {meeting.status === 'completed' ? (
                        <RAGChat meetingId={id} />
                    ) : (
                        <Card className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground/70">
                                Chat will be available once processing is complete
                            </p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
