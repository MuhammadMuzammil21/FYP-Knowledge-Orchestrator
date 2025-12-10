import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Entities } from '@/types';
import { Users, Tag, CheckSquare, FileText } from 'lucide-react';

interface EntitiesPanelProps {
    entities: Entities;
}

export function EntitiesPanel({ entities }: EntitiesPanelProps) {
    // Handle undefined entities gracefully
    const { speakers = [], topics = [], tasks = [], decisions = [] } = entities || {};

    return (
        <div className="space-y-4">
            {/* Speakers */}
            {speakers.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5" />
                            Speakers ({speakers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {speakers.map((speaker, index) => (
                                <Badge key={index} variant="secondary">
                                    {speaker}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Topics */}
            {topics.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Tag className="h-5 w-5" />
                            Topics ({topics.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {topics.map((topic, index) => (
                                <Badge key={index} variant="outline">
                                    {topic}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckSquare className="h-5 w-5" />
                            Tasks ({tasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border p-3 hover:bg-muted"
                                >
                                    <div className="mb-1 font-medium">{task.task}</div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {task.assignee && (
                                            <span>
                                                <strong>Assignee:</strong> {task.assignee}
                                            </span>
                                        )}
                                        {task.due && (
                                            <span>
                                                <strong>Due:</strong> {task.due}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Decisions */}
            {decisions.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            Decisions ({decisions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {decisions.map((decision, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border p-3 hover:bg-muted"
                                >
                                    <div className="mb-1 font-medium">{decision.statement}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {decision.decidedBy && (
                                            <span>
                                                <strong>Decided by:</strong> {decision.decidedBy}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {speakers.length === 0 &&
                topics.length === 0 &&
                tasks.length === 0 &&
                decisions.length === 0 && (
                    <Card>
                        <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
                            No entities extracted yet
                        </CardContent>
                    </Card>
                )}
        </div>
    );
}
