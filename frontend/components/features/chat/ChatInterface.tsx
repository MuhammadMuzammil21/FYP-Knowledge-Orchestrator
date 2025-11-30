'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRagQuery } from '../../../src/lib/hooks/useMeetings';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
    meetingId: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    context?: { chunk: string; score: number }[];
}

export function ChatInterface({ meetingId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // We use the hook imperatively or just call the API directly?
    // The hook is useQuery, which is declarative.
    // For chat, we usually want imperative fetching on submit.
    // We can use useQuery with `enabled: false` and `refetch`, but useMutation is better for actions.
    // However, `ragQuery` is a GET request.
    // Let's use a local state to trigger the query or just use the API client directly if we exported it.
    // Since we only have the hook `useRagQuery`, we can use it but we need to manage the query key.
    // Actually, for a chat interface, it's better to have a mutation-like behavior.
    // But since it's a GET, we can just use `refetch` from a disabled query?
    // No, that's messy for multiple messages.
    // Let's just use `fetch` or `axios` directly here or assume we can import `meetingsApi`.
    // Wait, I can't import `meetingsApi` easily if it's not exported or if I want to stick to hooks.
    // I'll use the `useRagQuery` hook but I need to handle the state.
    // Actually, I'll modify the component to just use `meetingsApi` if I can import it.
    // I can import `meetingsApi` from `../../../src/lib/api/meetings`.

    // Wait, I can't easily change the hook now.
    // Let's implement a simple way: 
    // We will use a state `query` that triggers the hook.

    const [currentQuery, setCurrentQuery] = useState('');
    const { data: ragResponse, isLoading, isError } = useRagQuery(meetingId, currentQuery);

    useEffect(() => {
        if (ragResponse && currentQuery) {
            // Add assistant message
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: ragResponse.answer,
                    context: ragResponse.context
                }
            ]);
            setCurrentQuery(''); // Reset query to stop fetching
            setIsTyping(false);
        }
    }, [ragResponse, currentQuery]);

    useEffect(() => {
        if (isError) {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Sorry, I encountered an error while processing your request."
                }
            ]);
            setCurrentQuery('');
            setIsTyping(false);
        }
    }, [isError]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setCurrentQuery(input);
        setInput('');
        setIsTyping(true);
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Assistant
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 space-y-2">
                                <Bot className="h-12 w-12 mx-auto opacity-20" />
                                <p>Ask me anything about this meeting!</p>
                                <p className="text-xs">Try: "What were the key decisions?" or "Who is responsible for the budget?"</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>

                                <div className="space-y-2">
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>

                                    {/* Context Sources */}
                                    {msg.context && msg.context.length > 0 && (
                                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border">
                                            <p className="font-semibold mb-1">Sources:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {msg.context.slice(0, 2).map((ctx, idx) => (
                                                    <li key={idx} className="truncate max-w-[250px]" title={ctx.chunk}>
                                                        {ctx.chunk}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t mt-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isTyping}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
