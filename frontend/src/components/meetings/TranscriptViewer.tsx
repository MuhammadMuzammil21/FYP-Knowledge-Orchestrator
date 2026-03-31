'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TranscriptViewerProps {
    transcript: string;
    isLlmRewritten?: boolean;
}

export function TranscriptViewer({ transcript, isLlmRewritten }: TranscriptViewerProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Parse transcript into segments (assuming format: "Speaker: text")
    const segments = transcript.split('\n').filter(line => line.trim());

    // Filter segments based on search
    const filteredSegments = searchQuery
        ? segments.filter(segment =>
            segment.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : segments;

    const highlightText = (text: string, query: string) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} className="bg-primary/20 text-foreground">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="flex h-full flex-col">
            {/* Search Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search in transcript..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {isLlmRewritten && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        AI Enhanced
                    </span>
                )}
            </div>

            {/* Transcript Content */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card p-3 md:p-4">
                {filteredSegments.length > 0 ? (
                    <div className="space-y-4">
                        {filteredSegments.map((segment, index) => {
                            const [speaker, ...textParts] = segment.split(':');
                            const text = textParts.join(':').trim();

                            return (
                                <div key={index} className="group">
                                    {speaker && text ? (
                                        <>
                                            <div className="mb-1 font-semibold text-primary">
                                                {speaker}
                                            </div>
                                            <div className="text-foreground">
                                                {highlightText(text, searchQuery)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-foreground">
                                            {highlightText(segment, searchQuery)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        {searchQuery ? 'No results found' : 'No transcript available'}
                    </div>
                )}
            </div>

            {/* Results Count */}
            {searchQuery && (
                <div className="mt-2 text-sm text-muted-foreground">
                    Found {filteredSegments.length} result{filteredSegments.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
