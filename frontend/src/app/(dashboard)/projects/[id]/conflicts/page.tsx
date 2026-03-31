'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useProject } from '@/hooks/useProjects';
import { useProjectConflicts } from '@/hooks/useConflicts';
import { ConflictResolutionModal } from '@/components/conflicts/ConflictResolutionModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ConflictDetail } from '@/types';

interface ProjectConflictsPageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectConflictsPage({ params }: ProjectConflictsPageProps) {
    const { id } = use(params);
    const { data: project } = useProject(id);
    const { data: conflictsData, isLoading, error } = useProjectConflicts(id);

    const [selectedConflict, setSelectedConflict] = useState<ConflictDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleResolveClick = (conflict: ConflictDetail) => {
        setSelectedConflict(conflict);
        setIsModalOpen(true);
    };

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-destructive">Error Loading Conflicts</h2>
                    <p className="text-muted-foreground">Please try again later</p>
                </div>
            </div>
        );
    }

    const unresolvedConflicts = conflictsData?.conflicts.filter((c) => !c.resolved) || [];
    const resolvedConflicts = conflictsData?.conflicts.filter((c) => c.resolved) || [];

    return (
        <div className="h-full overflow-y-auto p-8">
            <Link
                href={`/projects/${id}`}
                className="mb-4 inline-flex items-center text-sm text-primary hover:underline"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to project
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Project Conflicts</h1>
                {project && <p className="mt-2 text-muted-foreground">{project.name}</p>}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            ) : conflictsData && conflictsData.conflicts.length > 0 ? (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="p-4 border-border/80 bg-card shadow-sm">
                            <div className="text-sm text-muted-foreground">Total Conflicts</div>
                            <div className="mt-1 text-3xl font-bold">{conflictsData.total_conflicts}</div>
                        </Card>
                        <Card className="p-4 border-destructive/30 bg-destructive/5 dark:bg-destructive/5 dark:border-destructive/20 shadow-sm">
                            <div className="text-sm text-muted-foreground">Unresolved</div>
                            <div className="mt-1 text-3xl font-bold text-destructive">
                                {unresolvedConflicts.length}
                            </div>
                        </Card>
                        <Card className="p-4 border-accent/30 bg-accent/5 dark:bg-accent/5 dark:border-accent/20 shadow-sm">
                            <div className="text-sm text-muted-foreground">Resolved</div>
                            <div className="mt-1 text-3xl font-bold text-accent">
                                {resolvedConflicts.length}
                            </div>
                        </Card>
                    </div>

                    {/* Unresolved Conflicts */}
                    {unresolvedConflicts.length > 0 && (
                        <div>
                            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Unresolved Conflicts ({unresolvedConflicts.length})
                            </h2>
                            <div className="space-y-3">
                                {unresolvedConflicts.map((conflict) => (
                                    <Card key={conflict.id} className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            conflict.severity === 'high'
                                                                ? 'destructive'
                                                                : 'default'
                                                        }
                                                    >
                                                        {conflict.severity.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {conflict.conflict_type.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="mb-3">{conflict.description}</p>
                                                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                                                    <span>Between meetings: </span>
                                                    <Link
                                                        href={`/meetings/${conflict.source_meeting_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {conflict.source_meeting_id.slice(0, 8)}
                                                    </Link>
                                                    <span> → </span>
                                                    <Link
                                                        href={`/meetings/${conflict.target_meeting_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {conflict.target_meeting_id.slice(0, 8)}
                                                    </Link>
                                                </div>
                                            </div>
                                            <Button onClick={() => handleResolveClick(conflict)} className="w-full sm:w-auto flex-shrink-0">
                                                Resolve
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resolved Conflicts */}
                    {resolvedConflicts.length > 0 && (
                        <div>
                            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-accent" />
                                Resolved Conflicts ({resolvedConflicts.length})
                            </h2>
                            <div className="space-y-3">
                                {resolvedConflicts.map((conflict) => (
                                    <Card key={conflict.id} className="p-6 opacity-75">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="mt-1 h-5 w-5 text-accent" />
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {conflict.severity.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {conflict.conflict_type.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="mb-2 line-through">{conflict.description}</p>
                                                {conflict.resolution_note && (
                                                    <div className="mt-2 rounded bg-accent/10 p-3">
                                                        <p className="text-sm font-medium text-accent-foreground">
                                                            Resolution Note:
                                                        </p>
                                                        <p className="text-sm text-foreground">
                                                            {conflict.resolution_note}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold text-muted-foreground">No Conflicts</h2>
                        <p className="text-muted-foreground/70">
                            No conflicts detected in this project
                        </p>
                    </div>
                </div>
            )}

            {/* Resolution Modal */}
            {selectedConflict && (
                <ConflictResolutionModal
                    conflict={selectedConflict}
                    projectId={id}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedConflict(null);
                    }}
                />
            )}
        </div>
    );
}
