'use client';

import { useState } from 'react';
import { useKnownSpeakers, useDeleteKnownSpeaker, useUpdateKnownSpeaker } from '@/hooks/useKnownSpeakers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { User, Trash2, Edit2, Check, X } from 'lucide-react';
import type { KnownSpeaker } from '@/types';

export default function KnownSpeakersPage() {
    const { data: speakers, isLoading, error } = useKnownSpeakers();
    const deleteSpeaker = useDeleteKnownSpeaker();
    const updateSpeaker = useUpdateKnownSpeaker();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const handleEdit = (speaker: KnownSpeaker) => {
        setEditingId(speaker.id);
        setEditName(speaker.name);
    };

    const handleSave = (id: number) => {
        if (editName.trim()) {
            updateSpeaker.mutate(
                { id, data: { name: editName.trim() } },
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

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            deleteSpeaker.mutate(id);
        }
    };

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-destructive">Error Loading Known Speakers</h2>
                    <p className="text-muted-foreground">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Known Speakers</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage speaker identities across all your meetings
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            ) : speakers && speakers.length > 0 ? (
                <div className="space-y-4">
                    {speakers.map((speaker) => (
                        <Card key={speaker.id} className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        {editingId === speaker.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-64"
                                                    disabled={updateSpeaker.isPending}
                                                    autoFocus
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
                                                <h3 className="font-semibold text-lg">{speaker.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Appears in {speaker.meeting_count} meeting{speaker.meeting_count !== 1 ? 's' : ''}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {editingId !== speaker.id && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(speaker)}
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(speaker.id, speaker.name)}
                                            disabled={deleteSpeaker.isPending}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <User className="h-10 w-10 text-muted-foreground" />
                            </div>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-muted-foreground">No Known Speakers Yet</h2>
                        <p className="text-muted-foreground/70">
                            Known speakers are created automatically from meeting speakers
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
