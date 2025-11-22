'use client';

import { CheckSquare, CheckCircle2, Clock, User, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatTimestamp } from '@/lib/utils/formatters';
import type { Entities } from '@/types';

interface EntityPanelProps {
  entities: Entities;
  onTimestampClick?: (timestamp: number) => void;
}

export function EntityPanel({ entities, onTimestampClick }: EntityPanelProps) {
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
      <CardHeader className="border-b">
        <CardTitle>Extracted Insights</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6 space-y-6">
            {/* Tasks Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  Tasks
                  <Badge variant="secondary" className="ml-2">
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
                    <Card key={task.id} className="p-4">
                      <div className="space-y-3">
                        {/* Task Description */}
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={task.status === 'complete'}
                            className="mt-1"
                            disabled
                          />
                          <div className="flex-1 space-y-2">
                            <p className="text-sm leading-relaxed">
                              {task.description}
                            </p>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
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

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge
                            variant={task.status === 'complete' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.status}
                          </Badge>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTimestampClick?.(task.timestamp)}
                            className="h-7 text-xs"
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
            </div>

            <Separator />

            {/* Decisions Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">
                  Decisions
                  <Badge variant="secondary" className="ml-2">
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
                    <Card key={decision.id} className="p-4">
                      <div className="space-y-3">
                        {/* Decision Statement */}
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <p className="text-sm leading-relaxed">
                              {decision.statement}
                            </p>

                            {/* Metadata */}
                            {decision.decidedBy && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>Decided by: {decision.decidedBy}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTimestampClick?.(decision.timestamp)}
                            className="h-7 text-xs"
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
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}