import { MessageResponse } from './MessageResponse';
import { formatShortTime } from '@/lib/utils/date';

interface AssistantMessageProps {
  content: string;
  timestamp: Date;
  context?: Array<{ chunk: string; score: number }>;
}

/**
 * AssistantMessage Component
 * Displays AI assistant's response with markdown and context
 */
export function AssistantMessage({ content, timestamp, context }: AssistantMessageProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">🤖 AI Assistant</span>
          <span className="text-xs text-muted-foreground">{formatShortTime(timestamp)}</span>
        </div>
        <MessageResponse answer={content} context={context} showThinking={false} />
      </div>
    </div>
  );
}
