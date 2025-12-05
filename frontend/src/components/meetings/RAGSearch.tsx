'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ragQuery } from '@/lib/api/meetings';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

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
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Answer */}
            {answer && (
                <Card className="bg-blue-50">
                    <CardContent className="pt-6">
                        <h3 className="mb-2 font-semibold text-blue-900">Answer</h3>
                        <p className="text-gray-700">{answer}</p>
                    </CardContent>
                </Card>
            )}

            {/* Context Chunks */}
            {context.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Relevant Context</h3>
                    {context.map((item, index) => (
                        <Card key={index} className="bg-gray-50">
                            <CardContent className="pt-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">
                                        Context {index + 1}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Relevance: {(item.score * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">{item.chunk}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!answer && !isLoading && (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-gray-500">
                    Ask a question to search the meeting using AI
                </div>
            )}
        </div>
    );
}
