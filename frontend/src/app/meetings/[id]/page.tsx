'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TranscriptViewer } from '@/components/features/transcript/TranscriptViewer';
import { SearchBar } from '@/components/features/transcript/SearchBar';
import { EntityPanel } from '@/components/features/entities/EntityPanel';
import { useMeeting, useTranscript, useEntities, useSearchTranscript } from '@/lib/hooks/useMeetings';
import { formatDate, formatDuration } from '@/lib/utils/formatters';

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Fetch data
  const { data: meeting, isLoading: meetingLoading, isError: meetingError } = useMeeting(meetingId);
  const { data: transcriptData, isLoading: transcriptLoading } = useTranscript(meetingId);
  const { data: entities, isLoading: entitiesLoading } = useEntities(meetingId);
  const { data: searchResults } = useSearchTranscript(meetingId, searchQuery);

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
    // Scroll to transcript segment
    console.log('Jump to timestamp:', timestamp);
    // You can implement smooth scrolling here
  };

  // Loading state
  if (meetingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (meetingError || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-2xl font-semibold">Meeting not found</h2>
          <p className="text-muted-foreground">
            The meeting you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Meetings
            </Button>

            {/* Meeting Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{meeting.title}</h1>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
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