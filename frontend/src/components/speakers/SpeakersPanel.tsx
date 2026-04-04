'use client';

import { useState } from 'react';
import {
  useSpeakers,
  useUpdateSpeaker,
  useLinkSpeaker,
  useUnlinkSpeaker,
} from '@/hooks/useSpeakers';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTeam } from '@/hooks/useTeams';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Edit2, Check, X, Link as LinkIcon } from 'lucide-react';
import type { Speaker } from '@/types'; // API type with snake_case

interface SpeakersPanelProps {
  meetingId: string;
}

export function SpeakersPanel({ meetingId }: SpeakersPanelProps) {
  const { activeTeamSlug } = useWorkspace();
  const { data: teamDetail } = useTeam(activeTeamSlug || '');
  const { data: speakers, isLoading, error } = useSpeakers(meetingId);

  const updateSpeaker = useUpdateSpeaker(meetingId);
  const linkSpeaker = useLinkSpeaker(meetingId);
  const unlinkSpeaker = useUnlinkSpeaker(meetingId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editLinkedUser, setEditLinkedUser] = useState<string>('none');

  const handleEdit = (speaker: Speaker) => {
    setEditingId(speaker.id);
    setEditName(speaker.display_name);
    setEditLinkedUser(speaker.linked_user_id || 'none');
  };

  const handleSave = (speakerId: number) => {
    if (editName.trim()) {
      updateSpeaker.mutate(
        { speakerId, displayName: editName.trim() },
        {
          onSuccess: () => {
            if (editLinkedUser === 'none') {
              unlinkSpeaker.mutate({ speakerId });
            } else if (editLinkedUser) {
              linkSpeaker.mutate({ speakerId, userId: editLinkedUser });
            }

            setEditingId(null);
            setEditName('');
            setEditLinkedUser('none');
          },
        }
      );
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditLinkedUser('none');
  };

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-center text-destructive">Error loading speakers</p>
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
      <h3 className="mb-4 text-lg font-semibold">Speakers ({speakers.length})</h3>
      <div className="space-y-3">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4 sm:gap-0"
          >
            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {editingId === speaker.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <div className="flex flex-col gap-2 w-full sm:w-48">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full"
                        disabled={
                          updateSpeaker.isPending ||
                          linkSpeaker.isPending ||
                          unlinkSpeaker.isPending
                        }
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(speaker.id);
                          if (e.key === 'Escape') handleCancel();
                        }}
                      />
                      {teamDetail && teamDetail.members && teamDetail.members.length > 0 && (
                        <Select value={editLinkedUser} onValueChange={setEditLinkedUser}>
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Link to member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not linked</SelectItem>
                            {teamDetail.members.map((m) => (
                              <SelectItem key={m.user_id} value={m.user_id}>
                                {m.name || m.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="flex gap-2">
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
                  </div>
                ) : (
                  <>
                    <p className="font-medium truncate">{speaker.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {speaker.original_label}
                      {speaker.linked_user_id ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-primary">
                          <LinkIcon className="h-3 w-3" />
                          {speaker.neo4j_person_name || 'Linked Member'}
                        </span>
                      ) : (
                        speaker.known_speaker_id && (
                          <span className="ml-2 inline-flex items-center gap-1 text-primary">
                            <LinkIcon className="h-3 w-3" />
                            Linked (Voice)
                          </span>
                        )
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
                className="w-full sm:w-auto shrink-0"
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
