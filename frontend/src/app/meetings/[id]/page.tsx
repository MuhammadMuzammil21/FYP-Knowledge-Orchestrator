'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { TranscriptViewer } from '@/components/features/transcript/TranscriptViewer';
import { SearchBar } from '@/components/features/transcript/SearchBar';
import { EntityPanel } from '@/components/features/entities/EntityPanel';
import { Navbar } from '@/components/layout/Navbar';
import { useMeeting, useTranscript, useEntities, useSearchTranscript, useMeetingStatus } from '../../../lib/hooks/useMeetings';
import { ProcessingStatusIndicator } from '@/components/features/meetings/ProcessingStatusIndicator';
import { CompactProgressBar } from '@/components/features/meetings/CompactProgressBar';
import { formatDate, formatDuration } from '../../../lib/utils/formatters';
import { Badge } from '@/components/ui/badge';

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Fetch data
  const { data: meeting, isLoading: meetingLoading, isError: meetingError } = useMeeting(meetingId);
  const { data: transcriptData, isLoading: transcriptLoading } = useTranscript(meetingId);
  const { data: entities, isLoading: entitiesLoading } = useEntities(meetingId);
  const { data: searchResults } = useSearchTranscript(meetingId, searchQuery);
  
  // Real-time status updates
  const { data: processingStatus } = useMeetingStatus(
    meetingId,
    meeting?.status === 'processing'
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentSearchIndex(0);
  };

  const handleNavigateSearch = (direction: 'prev' | 'next') => {
    if (!searchResults?.results) return;

    if (direction === 'next') {
      setCurrentSearchIndex((prev) => 
        prev + 1 >= searchResults.results.length ? 0 : prev + 1
      );
    } else {
      setCurrentSearchIndex((prev) => 
        prev - 1 < 0 ? searchResults.results.length - 1 : prev - 1
      );
    }
  };

  const handleTimestampClick = (timestamp: number) => {
    console.log('Jump to timestamp:', timestamp);
  };

  // Loading state
  if (meetingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading meeting...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (meetingError || !meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold">Meeting not found</h2>
            <p className="text-muted-foreground">
              The meeting you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <Navbar />

      {/* Meeting Header */}
      <div className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{meeting.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{formatDate(meeting.uploadDate)}</span>
              <span>•</span>
              {meeting.duration > 0 && (
                <>
                  <span>{formatDuration(meeting.duration)}</span>
                  <span>•</span>
                </>
              )}
              {meeting.speakerCount > 0 && (
                <>
                  <span>{meeting.speakerCount} speakers</span>
                  <span>•</span>
                </>
              )}
              <Badge variant={meeting.status === 'complete' ? 'default' : 'secondary'}>
                {meeting.status}
              </Badge>
            </div>
            
            {/* Compact Progress Bar in Header */}
            {meeting.status === 'processing' && processingStatus && (
              <div className="pt-2 max-w-md">
                <CompactProgressBar status={processingStatus} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Processing Status Indicator - Show when processing */}
        {(meeting.status === 'processing' || meeting.status === 'failed') && processingStatus && (
          <div className="mb-6">
            <ProcessingStatusIndicator status={processingStatus} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transcript */}
          <div className="lg:col-span-2 space-y-4">
            <SearchBar
              onSearch={handleSearch}
              resultCount={searchResults?.count || 0}
              currentIndex={currentSearchIndex}
              onNavigate={handleNavigateSearch}
            />

            {transcriptLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TranscriptViewer
                segments={transcriptData?.segments || []}
                searchQuery={searchQuery}
                onTimestampClick={handleTimestampClick}
              />
            )}
          </div>

          {/* Right Column - Entities */}
          <div className="lg:col-span-1">
            {entitiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <EntityPanel
                entities={entities || { tasks: [], decisions: [] }}
                onTimestampClick={handleTimestampClick}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}