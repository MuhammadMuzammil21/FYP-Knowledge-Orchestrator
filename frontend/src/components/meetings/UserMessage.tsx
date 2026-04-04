import { Card } from '@/components/ui/card';
import { formatShortTime } from '@/lib/utils/date';

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

/**
 * UserMessage Component
 * Displays user's question in chat-style bubble
 */
export function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[80%]">
        <div className="flex items-center gap-2 mb-1 justify-end">
          <span className="text-xs text-muted-foreground">{formatShortTime(timestamp)}</span>
          <span className="text-sm font-medium text-foreground">You</span>
        </div>
        <Card className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm border-primary">
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
