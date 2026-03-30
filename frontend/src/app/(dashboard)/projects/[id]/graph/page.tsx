'use client';

import { use } from 'react';
import Link from 'next/link';
import { useProjectGraph } from '@/hooks/useProjects';
import { KnowledgeGraphViewer } from '@/components/graph/KnowledgeGraphViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

interface ProjectGraphPageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectGraphPage({ params }: ProjectGraphPageProps) {
    const { id } = use(params);
    const { data: graphData, isLoading, error } = useProjectGraph(id);

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
        <div className="flex h-full flex-col p-8">
            <Link
                href={`/projects/${id}`}
                className="mb-4 inline-flex items-center text-sm text-primary hover:underline"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to project
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Project Knowledge Graph</h1>
                <p className="mt-2 text-muted-foreground">
                    Combined knowledge graph from all meetings in this project
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
                    <p className="text-muted-foreground/70">No graph data available for this project</p>
                </div>
            )}
        </div>
    );
}
