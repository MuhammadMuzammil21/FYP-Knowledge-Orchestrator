'use client';

import { useState } from 'react';
import { useSpeakers, useUpdateSpeaker } from '@/hooks/useSpeakers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Edit2, Check, X, Link as LinkIcon } from 'lucide-react';
import type { Speaker } from '@/types'; // API type with snake_case

interface SpeakersPanelProps {
    meetingId: string;
}

export function SpeakersPanel({ meetingId }: SpeakersPanelProps) {
    const { data: speakers, isLoading, error } = useSpeakers(meetingId);
    const updateSpeaker = useUpdateSpeaker(meetingId);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const handleEdit = (speaker: Speaker) => {
        setEditingId(speaker.id);
        setEditName(speaker.display_name);
    };

    const handleSave = (speakerId: number) => {
        if (editName.trim()) {
            updateSpeaker.mutate(
                { speakerId, displayName: editName.trim() },
                {
                    onSuccess: () => {
                        setEditingId(null);
                        setEditName('');
                    },
                }
            );
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditName('');
    };

    if (error) {
        return (
            <Card className="p-6">
                <p className="text-center text-red-600">Error loading speakers</p>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Speakers</h3>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                    ))}
                </div>
            </Card>
        );
    }

    if (!speakers || speakers.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Speakers</h3>
                <p className="text-center text-muted-foreground">No speakers identified in this meeting</p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
                Speakers ({speakers.length})
            </h3>
            <div className="space-y-3">
                {speakers.map((speaker) => (
                    <div
                        key={speaker.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                {editingId === speaker.id ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-48"
                                            disabled={updateSpeaker.isPending}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSave(speaker.id);
                                                if (e.key === 'Escape') handleCancel();
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave(speaker.id)}
                                            disabled={!editName.trim() || updateSpeaker.isPending}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCancel}
                                            disabled={updateSpeaker.isPending}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-medium">{speaker.display_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {speaker.original_label}
                                            {speaker.known_speaker_id && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-primary">
                                                    <LinkIcon className="h-3 w-3" />
                                                    Linked
                                                </span>
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {editingId !== speaker.id && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(speaker)}
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
