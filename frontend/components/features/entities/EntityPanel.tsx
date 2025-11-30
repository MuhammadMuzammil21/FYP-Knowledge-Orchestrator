'use client';

import { CheckSquare, CheckCircle2, Clock, User, ExternalLink, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatTimestamp } from '@/lib/utils/formatters';
import type { Entities } from '@/types';
import { ConflictList } from '../conflicts/ConflictList';
import { useParams } from 'next/navigation';

interface EntityPanelProps {
    entities: Entities;
    onTimestampClick?: (timestamp: number) => void;
}

export function EntityPanel({ entities, onTimestampClick }: EntityPanelProps) {
    const params = useParams();
    const meetingId = params.id as string;

    const formatDeadline = (deadline: string | null) => {
        if (!deadline) return null;
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!entities) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Entities</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No entities extracted
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { tasks = [], decisions = [] } = entities;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b pb-2">
                <CardTitle>Insights</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <Tabs defaultValue="tasks" className="h-full flex flex-col">
                    <div className="px-4 pt-2">
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="tasks">Tasks</TabsTrigger>
                            <TabsTrigger value="decisions">Decisions</TabsTrigger>
                            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            <TabsContent value="tasks" className="mt-0 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckSquare className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-sm">
                                        Action Items
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                            {tasks.length}
                                        </Badge>
                                    </h3>
                                </div>

                                {tasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        No tasks identified
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {tasks.map((task) => (
                                            <Card key={task.id} className="p-3">
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            checked={task.status === 'complete'}
                                                            className="mt-1"
                                                            disabled
                                                        />
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm leading-relaxed">
                                                                {task.description}
                                                            </p>

                                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                                {task.owner && (
                                                                    <div className="flex items-center gap-1">
                                                                        <User className="h-3 w-3" />
                                                                        <span>{task.owner}</span>
                                                                    </div>
                                                                )}

                                                                {task.deadline && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{formatDeadline(task.deadline)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <Badge
                                                            variant={task.status === 'complete' ? 'default' : 'secondary'}
                                                            className="text-[10px] px-1.5 h-5"
                                                        >
                                                            {task.status}
                                                        </Badge>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onTimestampClick?.(task.timestamp)}
                                                            className="h-6 text-[10px] px-2"
                                                        >
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            {formatTimestamp(task.timestamp)}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="decisions" className="mt-0 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <h3 className="font-semibold text-sm">
                                        Key Decisions
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                            {decisions.length}
                                        </Badge>
                                    </h3>
                                </div>

                                {decisions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        No decisions recorded
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {decisions.map((decision) => (
                                            <Card key={decision.id} className="p-3">
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                                        </div>

                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm leading-relaxed">
                                                                {decision.statement}
                                                            </p>

                                                            {decision.decidedBy && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <User className="h-3 w-3" />
                                                                    <span>Decided by: {decision.decidedBy}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end pt-2 border-t">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onTimestampClick?.(decision.timestamp)}
                                                            className="h-6 text-[10px] px-2"
                                                        >
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            {formatTimestamp(decision.timestamp)}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="conflicts" className="mt-0">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <h3 className="font-semibold text-sm">
                                        Detected Conflicts
                                    </h3>
                                </div>
                                <ConflictList meetingId={meetingId} />
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </CardContent>
        </Card>
    );
}
