'use client';

import { useRouter } from 'next/navigation';
import { UploadForm } from '@/components/features/upload/UploadForm';
import { MeetingList } from '@/components/features/meetings/MeetingList';
import { UserMenu } from '@/components/layout/UserMenu';

export default function HomePage() {
  const router = useRouter();

  const handleUploadSuccess = (meetingId: string) => {
    // Navigate to meeting detail page after successful upload
    router.push(`/meetings/${meetingId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                AI Meeting Orchestrator
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Transform meetings into structured, searchable knowledge
              </p>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Upload Meeting</h2>
              <p className="text-muted-foreground">
                Upload your meeting recording to get started with AI-powered transcription and insights
              </p>
            </div>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </section>

          {/* Meetings Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Recent Meetings</h2>
              <p className="text-muted-foreground">
                View and manage your processed meetings
              </p>
            </div>
            <MeetingList />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            AI Meeting Knowledge Orchestrator • FYP 2025 • FAST-NUCES Karachi
          </p>
        </div>
      </footer>
    </div>
  );
}