import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Entities } from '@/types';
import { Users, Tag, CheckSquare, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EntitiesPanelProps {
  entities: Entities;
  onReprocess?: () => void;
  isReprocessing?: boolean;
}

export function EntitiesPanel({ entities, onReprocess, isReprocessing }: EntitiesPanelProps) {
  // Handle undefined entities gracefully
  const { speakers = [], topics = [], tasks = [], decisions = [] } = entities || {};

  const isEmpty = speakers.length === 0 &&
    topics.length === 0 &&
    tasks.length === 0 &&
    decisions.length === 0;

  return (
    <div className="space-y-4">
      {/* Empty State */}
      {isEmpty && (
        <Card className="border-dashed border-2 py-8 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="max-w-[400px]">
              <h3 className="text-lg font-semibold mb-1">No AI Insights Found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This meeting hasn't been processed for insights yet, or the transcript was changed. 
              </p>
              {onReprocess && (
                <Button 
                  onClick={onReprocess} 
                  disabled={isReprocessing}
                  className="gap-2"
                >
                  {isReprocessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate AI Insights
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                <Badge
                  key={index}
                  className="bg-primary/10 text-primary border border-primary/30 dark:bg-primary/10 dark:text-primary dark:border-primary/20 whitespace-normal text-left h-auto py-1 px-3"
                >
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
                <Badge
                  key={index}
                  className="bg-accent/10 text-accent border border-accent/40 dark:bg-accent/10 dark:text-accent dark:border-accent/20 whitespace-normal text-left h-auto py-1 px-3"
                >
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
                  className="rounded-lg border border-border bg-muted/40 dark:bg-muted/20 p-3 hover:bg-muted transition-colors"
                >
                  <div className="mb-1 font-medium">{task.task}</div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {task.assignee && (
                      <span className="shrink-0">
                        <strong>Assignee:</strong> {task.assignee}
                      </span>
                    )}
                    {task.due && (
                      <span className="shrink-0">
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
                  className="rounded-lg border border-border bg-muted/40 dark:bg-muted/20 p-3 hover:bg-muted transition-colors"
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


    </div>
  );
}
