'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatTimestamp } from '../../../src/lib/utils/formatters';
import { SPEAKER_COLORS } from '../../../src/config/constants';
import { cn } from '../../../src/lib/utils/cn';
import type { TranscriptSegment } from '../../../src/types';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  searchQuery?: string;
  onTimestampClick?: (timestamp: number) => void;
}

export function TranscriptViewer({
  segments,
  searchQuery,
  onTimestampClick,
}: TranscriptViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    segmentRefs.current = segmentRefs.current.slice(0, segments.length);
  }, [segments]);

  const getSpeakerColor = (speaker: string): string => {
    const speakerNum = parseInt(speaker.replace('Speaker ', '')) - 1;
    return SPEAKER_COLORS[speakerNum % SPEAKER_COLORS.length];
  };

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleCopySegment = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy', {
        description: 'Please try again',
      });
    }
  };

  if (!segments || segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-center text-muted-foreground">
            <p>No transcript available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Transcript</CardTitle>
          <Badge variant="secondary">
            {segments.length} segment{segments.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[600px] px-6 py-4">
          <div className="space-y-4">
            {segments.map((segment, index) => (
              <div
                key={index}
                ref={(el) => {
                  segmentRefs.current[index] = el;
                }}
                className={cn(
                  "group p-4 rounded-lg transition-colors",
                  "hover:bg-muted/50"
                )}
                onClick={() => onTimestampClick?.(segment.timestamp)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      style={{ backgroundColor: getSpeakerColor(segment.speaker) }}
                      className="text-white"
                    >
                      {segment.speaker}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTimestamp(segment.timestamp)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySegment(segment.text, index);
                    }}
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Text */}
                <p className="text-sm leading-relaxed">
                  {highlightText(segment.text, searchQuery)}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}