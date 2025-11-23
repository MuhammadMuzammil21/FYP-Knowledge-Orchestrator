'use client';

import { useRouter } from 'next/navigation';
import { UploadForm } from '@/components/features/upload/UploadForm';
import { MeetingList } from '@/components/features/meetings/MeetingList';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  const router = useRouter();

  const handleUploadSuccess = (meetingId: string) => {
    // Navigate to meeting detail page after successful upload
    router.push(`/meetings/${meetingId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <Navbar />

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
            HarBaat • FYP 2025 • FAST-NUCES Karachi
          </p>
        </div>
      </footer>
    </div>
  );
}