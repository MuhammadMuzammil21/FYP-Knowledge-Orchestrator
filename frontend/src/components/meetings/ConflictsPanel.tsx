import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Conflict } from '@/types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ConflictsPanelProps {
    conflicts: Conflict[];
}

const severityConfig = {
    high: {
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20',
    },
    medium: {
        icon: AlertCircle,
        color: 'text-accent-foreground',
        bgColor: 'bg-accent/5',
        borderColor: 'border-accent/20',
    },
    low: {
        icon: Info,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
    },
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

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                Found {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
            </div>

            {conflicts.map((conflict, index) => {
                const severity = (conflict.severity?.toLowerCase() || 'low') as keyof typeof severityConfig;
                const config = severityConfig[severity] || severityConfig.low;
                const Icon = config.icon;

                return (
                    <Card
                        key={index}
                        className={`${config.bgColor} ${config.borderColor} border-2`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Icon className={`h-5 w-5 ${config.color}`} />
                                <span className={config.color}>{conflict.type}</span>
                                <Badge variant="outline" className="ml-auto">
                                    {severity.toUpperCase()}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-3 text-foreground">{conflict.description}</p>
                            {conflict.related_meeting_id && (
                                <div className="text-sm text-muted-foreground">
                                    <strong>Related Meeting:</strong> {conflict.related_meeting_id}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
