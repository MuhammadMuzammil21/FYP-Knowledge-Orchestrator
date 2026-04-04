'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ragQuery } from '@/lib/api/meetings';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import { Send, Trash2 } from 'lucide-react';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '@/types/chat.types';

interface RAGChatProps {
  meetingId: string;
}

/**
 * RAGChat Component
 * Chat-style interface for RAG queries with persistent conversation history
 */
export function RAGChat({ meetingId }: RAGChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await ragQuery(meetingId, userMessage.content);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        context: response.context,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(getErrorMessage(error));

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (messages.length > 0) {
      if (confirm('Clear all messages? This cannot be undone.')) {
        setMessages([]);
        toast.success('Conversation cleared');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-border gap-3">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          💬 Ask Questions About This Meeting
        </h3>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 px-2 min-h-[250px] md:min-h-[400px] max-h-[500px] md:max-h-[600px]">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-center">
            <div className="space-y-3">
              <div className="text-5xl">👋</div>
              <p className="text-lg font-medium">Start a conversation!</p>
              <p className="text-sm text-muted-foreground">
                Ask any question about this meeting and I'll help you find answers
              </p>
            </div>
          </div>
        )}

        {messages.map((message) =>
          message.type === 'user' ? (
            <UserMessage key={message.id} content={message.content} timestamp={message.timestamp} />
          ) : (
            <AssistantMessage
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              context={message.context}
            />
          )
        )}

        {isLoading && <TypingIndicator />}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <Input
          placeholder="Ask a question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading || !query.trim()} className="gap-2">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>
  );
}
