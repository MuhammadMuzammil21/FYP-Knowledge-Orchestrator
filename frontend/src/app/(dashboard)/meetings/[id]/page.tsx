'use client';

import { use, useState, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TranscriptViewer } from '@/components/meetings/TranscriptViewer';
import { AudioPlayer, type AudioPlayerHandle } from '@/components/meetings/AudioPlayer';
import { EntitiesPanel } from '@/components/meetings/EntitiesPanel';
import { ConflictsPanel } from '@/components/meetings/ConflictsPanel';
import { RAGChat } from '@/components/meetings/RAGChat';
import { ProgressBar } from '@/components/meetings/ProgressBar';
import { StatusBadge } from '@/components/meetings/StatusBadge';
import { SpeakersPanel } from '@/components/speakers/SpeakersPanel';
import {
  useMeeting,
  useTranscript,
  useEntities,
  useDeleteMeeting,
  useMeetingAudio,
} from '@/hooks/useMeetingDetail';
import { useMeetingStatus } from '@/hooks/useMeetingStatus';
import { useProjectConflicts } from '@/hooks/useKnowledgeGraph';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useProject } from '@/hooks/useProjects';
import { useTeams } from '@/hooks/useTeams';
import { ArrowLeft, Network, Trash2, Loader2, AudioWaveform, ShieldAlert, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface MeetingDetailPageProps {
  params: Promise<{ id: string }>;
}

const LEGAL_DISCLAIMER =
  'By starting this recording, you confirm that you have informed all participants and ' +
  'obtained their consent to record and transcribe this conversation for meeting documentation ' +
  'and AI analysis purposes.';

export default function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useWorkspace();

  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState('transcript');
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);

  const { data: meeting, isLoading: meetingLoading } = useMeeting(id);
  const { data: status } = useMeetingStatus(id, true);
  const { data: transcriptData, isLoading: transcriptLoading } = useTranscript(id);
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities(id);
  const { data: conflictsData, isLoading: conflictsLoading } = useProjectConflicts(
    meeting?.projectId || ''
  );
  const { audioUrl, isLoading: audioLoading } = useMeetingAudio(id);
  const deleteMeeting = useDeleteMeeting();

  const { data: project } = useProject(meeting?.projectId || '');
  const { data: teams } = useTeams();
  const team = teams?.find(t => t.id === meeting?.teamId);

  const handleSegmentSeek = useCallback((seconds: number) => {
    audioPlayerRef.current?.seekTo(seconds);
    // Switch to transcript tab so user can follow along
    setActiveTab('transcript');
  }, []);

  const handleTimeUpdate = useCallback((t: number) => {
    setCurrentTime(t);
  }, []);

  // Speaker names from transcript for the relabeling dropdown
  const speakerNames = transcriptData?.content
    ? Array.from(
        new Set(
          transcriptData.content
            .split('\n')
            .map((line) => line.split(':')[0].trim())
            .filter(Boolean)
        )
      )
    : [];

  if (meetingLoading) {
    return (
      <div className="h-full p-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-8 h-4 w-96" />
        <Skeleton className="h-48 mb-4" />
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
  const isCompleted = meeting.status === 'completed';

  return (
    <div className="min-h-full overflow-y-auto p-3 sm:p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/meetings"
          className="mb-4 inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to meetings
        </Link>
        
        {/* Breadcrumbs */}
        {(project || team) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 font-medium">
            {team ? (
              <>
                <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer" title="Team Workspace">
                  {team.name}
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer" title="Personal Workspace">
                  Personal Project
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </>
            )}
            {project && (
              <span className="text-foreground flex items-center gap-1.5" title="Project">
                {project.name}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl md:text-3xl font-bold">
              Meeting {meeting.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isCompleted && (
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
                  if (
                    window.confirm(
                      'Are you sure you want to delete this meeting? This action cannot be undone.'
                    )
                  ) {
                    deleteMeeting.mutate(id, {
                      onSuccess: () => router.push('/meetings'),
                    });
                  }
                }}
              >
                {deleteMeeting.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
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

      {/* ── Audio Player ── */}
      {isCompleted && (
        <div className="mb-5">
          {audioLoading ? (
            <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              <span className="text-sm">Loading audio…</span>
            </div>
          ) : audioUrl ? (
            <AudioPlayer ref={audioPlayerRef} src={audioUrl} onTimeUpdate={handleTimeUpdate} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 text-muted-foreground">
              <AudioWaveform className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Audio not available for this meeting</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="mb-4 flex w-full h-auto p-1 bg-muted/60 dark:bg-muted/40 border border-border/60 rounded-lg overflow-x-auto">
          <TabsTrigger value="transcript" className="flex-1 min-w-[80px] text-xs sm:text-sm">
            Transcript
          </TabsTrigger>
          <TabsTrigger value="entities" className="flex-1 min-w-[72px] text-xs sm:text-sm">
            Entities
          </TabsTrigger>
          <TabsTrigger value="speakers" className="flex-1 min-w-[76px] text-xs sm:text-sm">
            Speakers
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex-1 min-w-[76px] text-xs sm:text-sm">
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="rag" className="flex-1 min-w-[54px] text-xs sm:text-sm">
            Chat
          </TabsTrigger>
        </TabsList>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="min-h-[300px]">
          {transcriptLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transcriptData ? (
            <TranscriptViewer
              meetingId={id}
              transcript={transcriptData.content}
              isLlmRewritten={transcriptData.isLlmRewritten}
              currentTime={currentTime}
              onSeek={audioUrl ? handleSegmentSeek : undefined}
              speakerNames={speakerNames}
            />
          ) : (
            <Card className="flex h-full items-center justify-center">
              <p className="text-muted-foreground/70">
                {isCompleted
                  ? 'No transcript available'
                  : 'Transcript will be available once processing is complete'}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="min-h-[300px] overflow-y-auto">
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
                {isCompleted
                  ? 'No entities extracted'
                  : 'Entities will be available once processing is complete'}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Speakers Tab */}
        <TabsContent value="speakers" className="min-h-[300px] overflow-y-auto">
          {isCompleted ? (
            <SpeakersPanel meetingId={id} onSeek={audioUrl ? handleSegmentSeek : undefined} />
          ) : (
            <Card className="flex h-full items-center justify-center">
              <p className="text-muted-foreground/70">
                Speakers will be available once processing is complete
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="min-h-[300px] overflow-y-auto">
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
                {isCompleted
                  ? 'No conflicts detected'
                  : 'Conflicts will be checked once processing is complete'}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* RAG Chat Tab */}
        <TabsContent value="rag" className="min-h-[300px]">
          {isCompleted ? (
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
