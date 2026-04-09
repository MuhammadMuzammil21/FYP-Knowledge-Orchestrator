import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import type { Conflict } from '@/types';

interface ConflictsPanelProps {
  conflicts: Conflict[];
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 dark:bg-destructive/10',
    borderColor: 'border-destructive/50 dark:border-destructive/20',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-accent dark:text-accent-foreground',
    bgColor: 'bg-accent/10 dark:bg-accent/5',
    borderColor: 'border-accent/50 dark:border-accent/20',
  },
  low: {
    icon: Info,
    color: 'text-primary',
    bgColor: 'bg-primary/10 dark:bg-primary/10',
    borderColor: 'border-primary/40 dark:border-primary/20',
  },
};

const formatConflictType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function ConflictsPanel({ conflicts }: ConflictsPanelProps) {
  // Handle undefined or empty conflicts
  if (!conflicts || conflicts.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
          No conflicts detected
        </CardContent>
      </Card>
    );
  }

  // We sort conflicts to show unresolved first
  const sortedConflicts = [...conflicts].sort((a, b) => {
    if (a.resolved === b.resolved) return 0;
    return a.resolved ? 1 : -1;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Found {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="text-muted-foreground">
            {conflicts.filter(c => c.resolved).length} Resolved
          </Badge>
          <Badge variant="outline" className="text-destructive">
            {conflicts.filter(c => !c.resolved).length} Unresolved
          </Badge>
        </div>
      </div>

      {sortedConflicts.map((conflict, index) => {
        const severity = (conflict.severity?.toLowerCase() || 'low') as keyof typeof severityConfig;
        const config = severityConfig[severity] || severityConfig.low;
        const Icon = conflict.resolved ? CheckCircle2 : config.icon;
        
        const isResolved = conflict.resolved;
        const cardBgColor = isResolved ? 'bg-muted/30 dark:bg-muted/10' : config.bgColor;
        const cardBorderColor = isResolved ? 'border-border' : config.borderColor;
        const iconColor = isResolved ? 'text-green-600 dark:text-green-500' : config.color;

        return (
          <Card key={index} className={`${cardBgColor} ${cardBorderColor} border-2 opacity-${isResolved ? '75' : '100'} transition-all`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className={`h-5 w-5 ${iconColor}`} />
                <span className={iconColor}>{formatConflictType(conflict.type || conflict.conflict_type || 'General')}</span>
                <div className="ml-auto flex items-center gap-2">
                  {isResolved && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      Resolved
                    </Badge>
                  )}
                  <Badge variant="outline" className={!isResolved ? config.color : ''}>
                    {severity.toUpperCase()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-foreground">{conflict.description}</p>
              
              <div className="flex flex-col gap-1 mt-4">
                {(conflict.related_meeting_id || conflict.source_meeting_id) && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium mr-1 text-foreground/80">Source Meeting:</span> 
                    {conflict.source_meeting_id || conflict.related_meeting_id}
                  </div>
                )}
                {conflict.target_meeting_id && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium mr-1 text-foreground/80">Target Meeting:</span> 
                    {conflict.target_meeting_id}
                  </div>
                )}
              </div>

              {isResolved && conflict.resolution_note && (
                <div className="mt-4 p-3 bg-background/50 rounded-md border border-border/50 text-sm">
                  <span className="font-semibold text-green-600 dark:text-green-500 block mb-1">Resolution Note:</span>
                  <span className="text-muted-foreground">{conflict.resolution_note}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
