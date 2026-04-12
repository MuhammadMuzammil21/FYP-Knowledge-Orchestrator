import { AlertCircle, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReprocessNoticeProps {
  isStale: boolean;
  isReprocessing: boolean;
  onReprocess: () => void;
  className?: string;
}

export function ReprocessNotice({ isStale, isReprocessing, onReprocess, className }: ReprocessNoticeProps) {
  if (!isStale && !isReprocessing) return null;

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-3 rounded-lg border text-sm transition-all duration-300",
      isStale 
        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500" 
        : "bg-primary/5 border-primary/10 text-primary",
      className
    )}>
      <div className="flex items-center gap-2">
        {isStale ? (
          <AlertCircle className="h-4 w-4 shrink-0" />
        ) : (
          <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
        )}
        <span>
          {isStale 
            ? "Transcript has been edited. Insights may be out of sync." 
            : "Regenerating summary, tasks, and graph data..."}
        </span>
      </div>
      
      {isStale && (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 gap-1.5"
          onClick={onReprocess}
          disabled={isReprocessing}
        >
          {isReprocessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Update Now
        </Button>
      )}
    </div>
  );
}
