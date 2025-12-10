'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, BookOpen } from 'lucide-react';

interface MessageResponseProps {
    answer: string;
    context?: Array<{ chunk: string; score: number }>;
    showThinking?: boolean;
}

/**
 * MessageResponse Component
 * Formats RAG API responses with markdown rendering and thinking tag removal
 */
export function MessageResponse({ answer, context, showThinking = false }: MessageResponseProps) {
    /**
     * Parse answer to remove <think> tags and extract thinking process
     */
    const parseAnswer = (rawAnswer: string) => {
        const thinkingMatch = rawAnswer.match(/<think>([\s\S]*?)<\/think>/);
        const thinking = thinkingMatch ? thinkingMatch[1].trim() : null;
        const cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        return { cleanAnswer, thinking };
    };

    const { cleanAnswer, thinking } = parseAnswer(answer);

    return (
        <div className="space-y-4">
            {/* Answer Section */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <MessageSquare className="h-5 w-5" />
                        Answer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {cleanAnswer}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>

            {/* Debug: Show Thinking Process */}
            {showThinking && thinking && (
                <Card className="bg-muted border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                            🧠 Thinking Process (Debug)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                            {thinking}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {/* Context Section */}
            {context && context.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BookOpen className="h-4 w-4" />
                        Supporting Context ({context.length})
                    </div>

                    {context.map((item, index) => (
                        <Card key={index} className="bg-muted border-border hover:border-border transition-colors">
                            <CardContent className="pt-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Context {index + 1}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        Relevance: {(item.score * 100).toFixed(1)}%
                                    </Badge>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {item.chunk}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
