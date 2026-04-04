'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ragQuery } from '@/lib/api/meetings';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { MessageResponse } from './MessageResponse';

interface RAGSearchProps {
  meetingId: string;
}

export function RAGSearch({ meetingId }: RAGSearchProps) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [context, setContext] = useState<Array<{ chunk: string; score: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setIsLoading(true);

    try {
      const response = await ragQuery(meetingId, query);
      setAnswer(response.answer);
      setContext(response.context);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setAnswer('');
      setContext([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Query Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask a question about this meeting..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {/* Response Display */}
      {answer && (
        <MessageResponse
          answer={answer}
          context={context}
          showThinking={false} // Set to true for debugging
        />
      )}

      {/* Empty State */}
      {!answer && !isLoading && (
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
          Ask a question to search the meeting using AI
        </div>
      )}
    </div>
  );
}
