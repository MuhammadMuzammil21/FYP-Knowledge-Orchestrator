'use client';

import { use } from 'react';
import { usePersonTasks } from '@/hooks/useGraph';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';

interface PersonTasksPageProps {
    params: Promise<{ name: string }>;
}

export default function PersonTasksPage({ params }: PersonTasksPageProps) {
    const { name } = use(params);
    const decodedName = decodeURIComponent(name);
    const { data: tasks, isLoading, error } = usePersonTasks(decodedName);

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-destructive">Error Loading Tasks</h2>
                    <p className="text-muted-foreground">Please try again later</p>
                </div>
            </div>
        );
    }

    const pendingTasks = tasks?.filter((t) => t.status !== 'completed') || [];
    const completedTasks = tasks?.filter((t) => t.status === 'completed') || [];

    return (
        <div className="h-full overflow-y-auto p-8">
            <Link
                href="/meetings"
                className="mb-4 inline-flex items-center text-sm text-primary hover:underline"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to meetings
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Tasks for {decodedName}</h1>
                <p className="mt-2 text-muted-foreground">
                    All tasks assigned to this person across meetings
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            ) : tasks && tasks.length > 0 ? (
                <div className="space-y-6">
                    {/* Pending Tasks */}
                    {pendingTasks.length > 0 && (
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">
                                Pending ({pendingTasks.length})
                            </h2>
                            <div className="space-y-3">
                                {pendingTasks.map((task) => (
                                    <Card key={task.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Circle className="mt-1 h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="font-medium">{task.description}</p>
                                                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                                    {task.due_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                Due:{' '}
                                                                {formatDate(task.due_date)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <Link
                                                        href={`/meetings/${task.meeting_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {task.meeting_title || `Meeting ${task.meeting_id.slice(0, 8)}`}
                                                    </Link>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{task.status}</Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">
                                Completed ({completedTasks.length})
                            </h2>
                            <div className="space-y-3">
                                {completedTasks.map((task) => (
                                    <Card key={task.id} className="p-4 opacity-75">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
                                            <div className="flex-1">
                                                <p className="font-medium line-through">{task.description}</p>
                                                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                                    <Link
                                                        href={`/meetings/${task.meeting_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {task.meeting_title || `Meeting ${task.meeting_id.slice(0, 8)}`}
                                                    </Link>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-accent/10">
                                                {task.status}
                                            </Badge>
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
                        <h2 className="mb-2 text-2xl font-bold text-muted-foreground">No Tasks Found</h2>
                        <p className="text-muted-foreground/70">
                            No tasks assigned to {decodedName} yet
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
