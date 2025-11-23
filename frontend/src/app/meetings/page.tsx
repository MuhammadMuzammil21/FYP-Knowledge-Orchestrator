'use client';

import { MeetingList } from '@/components/features/meetings/MeetingList';
import { Navbar } from '@/components/layout/Navbar';

export default function MeetingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">All Meetings</h1>
          <p className="text-muted-foreground">
            Browse and search through all your recorded meetings
          </p>
        </div>
        
        <MeetingList />
      </main>
    </div>
  );
}