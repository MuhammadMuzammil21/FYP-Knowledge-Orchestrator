'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMeetingGraph } from '@/hooks/useGraph';
import { MeetingGraphViewer } from '@/components/graph/MeetingGraphViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

interface MeetingGraphPageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingGraphPage({ params }: MeetingGraphPageProps) {
  const { id } = use(params);
  const { data: graphData, isLoading, error } = useMeetingGraph(id);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-destructive">Error Loading Graph</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 md:p-8">
      <Link
        href={`/meetings/${id}`}
        className="mb-4 inline-flex items-center text-sm text-primary hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to meeting
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Knowledge Graph</h1>
        <p className="mt-2 text-muted-foreground">
          Visual representation of entities and relationships in this meeting
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-full flex-1" />
      ) : graphData ? (
        <div className="flex-1">
          <MeetingGraphViewer data={graphData} />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center rounded-lg border bg-muted">
          <p className="text-muted-foreground/70">No graph data available for this meeting</p>
        </div>
      )}
    </div>
  );
}
