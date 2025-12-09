'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useResolveConflict } from '@/hooks/useConflicts';
import type { ConflictDetail } from '@/types';

interface ConflictResolutionModalProps {
    conflict: ConflictDetail;
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ConflictResolutionModal({
    conflict,
    projectId,
    isOpen,
    onClose,
}: ConflictResolutionModalProps) {
    const [resolutionNote, setResolutionNote] = useState('');
    const resolveConflict = useResolveConflict();

    const handleResolve = () => {
        resolveConflict.mutate(
            {
                projectId,
                conflictId: conflict.id,
                data: {
                    resolved: true,
                    resolution_note: resolutionNote.trim() || undefined,
                },
            },
            {
                onSuccess: () => {
                    setResolutionNote('');
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Resolve Conflict</DialogTitle>
                    <DialogDescription>
                        Mark this conflict as resolved and optionally add a note explaining the resolution.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Conflict Details */}
                    <div className="rounded-lg border bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <span
                                className={`rounded px-2 py-1 text-xs font-semibold uppercase ${conflict.severity === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : conflict.severity === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                            >
                                {conflict.severity}
                            </span>
                            <span className="text-sm text-gray-600">{conflict.conflict_type}</span>
                        </div>
                        <p className="text-sm">{conflict.description}</p>
                    </div>

                    {/* Resolution Note */}
                    <div className="space-y-2">
                        <Label htmlFor="resolution-note">Resolution Note (Optional)</Label>
                        <Textarea
                            id="resolution-note"
                            placeholder="Explain how this conflict was resolved..."
                            value={resolutionNote}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolutionNote(e.target.value)}
                            rows={4}
                            disabled={resolveConflict.isPending}
                        />
                        <p className="text-xs text-gray-500">
                            Add context about how this conflict was addressed
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={resolveConflict.isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleResolve} disabled={resolveConflict.isPending}>
                        {resolveConflict.isPending ? 'Resolving...' : 'Mark as Resolved'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
