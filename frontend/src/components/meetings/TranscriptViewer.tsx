'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Search, PencilLine, Save, Clock, Loader2, X, Check,
    ChevronRight, History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateTranscript, useTranscriptHistory } from '@/hooks/useMeetingDetail';

// ─── Types ──────────────────────────────────────────────────────────────────

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TranscriptSegment {
    speaker: string;
    text: string;
    start: number;  // seconds
    end: number;    // seconds
    start_formatted?: string; // 'HH:MM:SS'
}

interface EditableSegment extends TranscriptSegment {
    _editText: string;
    _editSpeaker: string;
    _modified: boolean;
}

interface TranscriptViewerProps {
    meetingId: string;
    /** Structured segments (preferred — required for playback sync & editing) */
    segments?: TranscriptSegment[];
    /** Fallback plain text (legacy) */
    transcript?: string;
    isLlmRewritten?: boolean;
    /** Current audio playback position in seconds */
    currentTime?: number;
    /** Called when user clicks a segment to seek audio */
    onSeek?: (seconds: number) => void;
    /** All unique speaker names in this meeting (for relabeling dropdown) */
    speakerNames?: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseTranscriptToSegments(raw: string): TranscriptSegment[] {
    return raw.split('\n').filter(Boolean).map((line, i) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const speaker = line.slice(0, colonIdx).trim();
            const text = line.slice(colonIdx + 1).trim();
            return { speaker, text, start: 0, end: 0 };
        }
        return { speaker: '', text: line, start: 0, end: 0 };
    });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TranscriptViewer({
    meetingId,
    segments: propSegments,
    transcript: propTranscript,
    isLlmRewritten,
    currentTime = 0,
    onSeek,
    speakerNames = [],
}: TranscriptViewerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editableSegments, setEditableSegments] = useState<EditableSegment[]>([]);
    const [activeIdx, setActiveIdx] = useState<number>(-1);
    const activeSegmentRef = useRef<HTMLDivElement>(null);

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const updateTranscript = useUpdateTranscript(meetingId);
    const { data: historyData, isLoading: historyLoading } = useTranscriptHistory(meetingId);

    // Resolve raw segments
    const baseSegments: TranscriptSegment[] = propSegments?.length
        ? propSegments
        : propTranscript
            ? parseTranscriptToSegments(propTranscript)
            : [];

    // All unique speakers for the dropdown
    const allSpeakers = Array.from(
        new Set([...speakerNames, ...baseSegments.map(s => s.speaker).filter(Boolean)])
    );

    // Initialise editable segments when base segments change
    useEffect(() => {
        setEditableSegments(
            baseSegments.map(seg => ({
                ...seg,
                _editText: seg.text,
                _editSpeaker: seg.speaker,
                _modified: false,
            }))
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propSegments, propTranscript]);

    // Track active segment during playback
    useEffect(() => {
        if (!baseSegments.length || !baseSegments[0].start && !baseSegments[0].end) return;
        const idx = baseSegments.findIndex(
            (seg, i) =>
                currentTime >= seg.start &&
                (i === baseSegments.length - 1 || currentTime < baseSegments[i + 1].start)
        );
        setActiveIdx(idx);
    }, [currentTime, baseSegments]);

    // Auto-scroll active segment into view
    useEffect(() => {
        if (activeSegmentRef.current) {
            activeSegmentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [activeIdx]);

    // Filtered view for search
    const displaySegments = searchQuery
        ? editableSegments.filter(s =>
            s._editText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s._editSpeaker.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : editableSegments;

    const highlightText = useCallback((text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className="bg-primary/20 text-foreground rounded-[2px]">{part}</mark>
                : part
        );
    }, []);

    const handleSegmentTextChange = (index: number, newText: string) => {
        setEditableSegments(prev =>
            prev.map((seg, i) =>
                i === index ? { ...seg, _editText: newText, _modified: true } : seg
            )
        );
    };

    const handleSpeakerChange = (index: number, newSpeaker: string) => {
        setEditableSegments(prev =>
            prev.map((seg, i) =>
                i === index ? { ...seg, _editSpeaker: newSpeaker, _modified: true } : seg
            )
        );
    };

    const handleSaveDraft = () => {
        const content = editableSegments
            .map(s => `${s._editSpeaker}: ${s._editText}`)
            .join('\n');
        const segments = editableSegments.map(s => ({
            speaker: s._editSpeaker,
            text: s._editText,
            start: s.start,
            end: s.end,
        }));
        updateTranscript.mutate({ content, segments }, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const hasModifications = editableSegments.some(s => s._modified);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search transcript…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 h-9"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Badges + actions */}
                <div className="flex items-center gap-2">
                    {isLlmRewritten && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                            AI Enhanced
                        </Badge>
                    )}

                    {/* Edit toggle */}
                    <Button
                        variant={isEditing ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={() => setIsEditing(e => !e)}
                    >
                        {isEditing
                            ? <><X className="h-3.5 w-3.5" /> Cancel</>
                            : <><PencilLine className="h-3.5 w-3.5" /> Edit</>
                        }
                    </Button>

                    {/* Save draft */}
                    {isEditing && (
                        <Button
                            size="sm"
                            className="h-9 gap-1.5"
                            onClick={handleSaveDraft}
                            disabled={updateTranscript.isPending || !hasModifications}
                        >
                            {updateTranscript.isPending
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Save className="h-3.5 w-3.5" />
                            }
                            Save draft
                        </Button>
                    )}

                    {/* History button */}
                    <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setIsHistoryOpen(true)}>
                        <History className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">History</span>
                    </Button>
                </div>
            </div>

            {/* ── Segments list ── */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card p-3 md:p-4">
                {displaySegments.length > 0 ? (
                    <div className="space-y-1">
                        {displaySegments.map((seg, index) => {
                            const globalIdx = editableSegments.indexOf(seg);
                            const isActive = globalIdx === activeIdx && activeIdx !== -1;
                            const hasTimestamps = seg.start !== 0 || seg.end !== 0;

                            return (
                                <div
                                    key={globalIdx}
                                    ref={isActive ? activeSegmentRef : undefined}
                                    className={cn(
                                        'group rounded-lg p-3 transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/10 border border-primary/20'
                                            : 'hover:bg-muted/50 border border-transparent',
                                        onSeek && hasTimestamps && !isEditing && 'cursor-pointer'
                                    )}
                                    onClick={() => {
                                        if (!isEditing && onSeek && hasTimestamps) {
                                            onSeek(seg.start);
                                        }
                                    }}
                                >
                                    {/* Speaker row */}
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {isEditing ? (
                                            <Select
                                                value={seg._editSpeaker || '__none__'}
                                                onValueChange={(val) =>
                                                    handleSpeakerChange(globalIdx, val === '__none__' ? '' : val)
                                                }
                                            >
                                                <SelectTrigger className="h-6 w-auto min-w-[100px] text-xs border-0 bg-muted/60 px-2">
                                                    <SelectValue placeholder="Speaker" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__none__">Unknown</SelectItem>
                                                    {allSpeakers.map(sp => (
                                                        <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            seg._editSpeaker && (
                                                <span className={cn(
                                                    'text-xs font-semibold',
                                                    isActive ? 'text-primary' : 'text-primary/80'
                                                )}>
                                                    {seg._editSpeaker}
                                                </span>
                                            )
                                        )}

                                        {/* Timestamp + seek indicator */}
                                        {hasTimestamps && (
                                            <span className={cn(
                                                'text-[10px] tabular-nums ml-auto transition-opacity',
                                                isActive ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                                            )}>
                                                {seg.start_formatted ?? formatTime(seg.start)}
                                            </span>
                                        )}
                                        {onSeek && hasTimestamps && !isEditing && (
                                            <ChevronRight className={cn(
                                                'h-3 w-3 text-muted-foreground transition-opacity',
                                                isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-60'
                                            )} />
                                        )}
                                        {seg._modified && (
                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20 ml-auto">
                                                edited
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Text */}
                                    {isEditing ? (
                                        <Textarea
                                            value={seg._editText}
                                            onChange={e => handleSegmentTextChange(globalIdx, e.target.value)}
                                            rows={Math.max(1, Math.ceil(seg._editText.length / 80))}
                                            className={cn(
                                                'text-sm bg-transparent resize-none',
                                                'border border-border/60 rounded-md px-2 py-1',
                                                'focus:border-primary/50 focus:bg-primary/5 transition-colors'
                                            )}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    ) : (
                                        <p className="text-sm leading-relaxed text-foreground">
                                            {highlightText(seg._editText, searchQuery)}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col h-full items-center justify-center text-muted-foreground py-12">
                        <Search className="h-8 w-8 mb-3 opacity-20" />
                        <p className="text-sm">
                            {searchQuery ? `No results for "${searchQuery}"` : 'No transcript available'}
                        </p>
                    </div>
                )}
            </div>

            {/* Search results count */}
            {searchQuery && (
                <p className="text-xs text-muted-foreground">
                    Found {displaySegments.length} result{displaySegments.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* ── History Dialog ── */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Transcript History</DialogTitle>
                        <DialogDescription>
                            Previous saved versions of this transcript
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                        {historyLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : historyData?.versions?.length ? (
                            <div className="space-y-2">
                                {historyData.versions.map((v) => (
                                    <div
                                        key={v.id}
                                        className="rounded-lg border border-border bg-muted/30 p-3 space-y-1"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="text-xs font-medium">
                                                {new Date(v.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        {v.edited_by && (
                                            <p className="text-xs text-muted-foreground pl-5">
                                                Edited by {v.edited_by}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground pl-5 line-clamp-2">
                                            {v.preview}…
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <History className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground">No history yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Save a draft to create the first version
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
