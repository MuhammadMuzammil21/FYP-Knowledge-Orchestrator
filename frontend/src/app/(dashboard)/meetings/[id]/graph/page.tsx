'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMeetingGraph } from '@/hooks/useGraph';
import { KnowledgeGraphViewer } from '@/components/graph/KnowledgeGraphViewer';
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
                    <h2 className="mb-2 text-2xl font-bold text-red-600">Error Loading Graph</h2>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col p-8">
            <Link
                href={`/meetings/${id}`}
                className="mb-4 inline-flex items-center text-sm text-blue-600 hover:underline"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to meeting
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Knowledge Graph</h1>
                <p className="mt-2 text-gray-600">
                    Visual representation of entities and relationships in this meeting
                </p>
            </div>

            {isLoading ? (
                <Skeleton className="h-full flex-1" />
            ) : graphData ? (
                <div className="flex-1">
                    <KnowledgeGraphViewer nodes={graphData.nodes} edges={graphData.edges} />
                </div>
            ) : (
                <div className="flex h-full items-center justify-center rounded-lg border bg-muted">
                    <p className="text-gray-500">No graph data available for this meeting</p>
                </div>
            )}
        </div>
    );
}
