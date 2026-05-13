'use client';

import { useState } from 'react';
import {
  useSpeakers,
  useUpdateSpeaker,
  useLinkSpeaker,
  useUnlinkSpeaker,
  useForceLinkEmailSpeaker,
  useRematchSpeaker,
  useReviewQueue,
  useProcessReviewProposal,
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
import { User, Edit2, Check, X, Link as LinkIcon, RefreshCw, Mail, Play, CheckCircle2, AlertCircle, Unlink } from 'lucide-react';
import type { Speaker, SpeakerReviewProposal } from '@/types';
import { toast } from 'sonner';

interface SpeakersPanelProps {
  meetingId: string;
  onSeek?: (seconds: number) => void;
}

export function SpeakersPanel({ meetingId, onSeek }: SpeakersPanelProps) {
  const { activeTeamSlug } = useWorkspace();
  const { data: teamDetail } = useTeam(activeTeamSlug || '');
  const { data: speakers, isLoading, error } = useSpeakers(meetingId);
  const { data: reviewQueue, isLoading: reviewLoading } = useReviewQueue(meetingId);

  const updateSpeaker = useUpdateSpeaker(meetingId);
  const linkSpeaker = useLinkSpeaker(meetingId);
  const unlinkSpeaker = useUnlinkSpeaker(meetingId);
  const forceLinkSpeaker = useForceLinkEmailSpeaker(meetingId);
  const rematchSpeaker = useRematchSpeaker(meetingId);
  const processReview = useProcessReviewProposal(meetingId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editLinkedUser, setEditLinkedUser] = useState<string>('none');
  const [forceLinkIds, setForceLinkIds] = useState<Record<number, string>>({}); // speakerId -> email
  const [showForceLink, setShowForceLink] = useState<number | null>(null);

  const handleEdit = (speaker: Speaker) => {
    setEditingId(speaker.id);
    setEditName(speaker.display_name);
    setEditLinkedUser(speaker.linked_user_id || 'none');
  };

  const handleSave = (speakerId: number) => {
    const originalSpeaker = speakers?.find((s: Speaker) => s.id === speakerId);
    const originalLinkedUser = originalSpeaker?.linked_user_id || 'none';

    if (editName.trim()) {
      updateSpeaker.mutate(
        { speakerId, displayName: editName.trim() },
        {
          onSuccess: () => {
            // Only trigger link/unlink if the selection actually changed
            if (editLinkedUser !== originalLinkedUser) {
              if (editLinkedUser === 'none') {
                unlinkSpeaker.mutate({ speakerId });
              } else {
                linkSpeaker.mutate({ speakerId, userId: editLinkedUser });
              }
            }
            setEditingId(null);
            setEditName('');
            setEditLinkedUser('none');
            toast.success('Speaker name updated');
          },
          onError: () => {
            toast.error('Failed to update speaker name');
          },
        }
      );
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditLinkedUser('none');
    setShowForceLink(null);
  };

  const handleForceLink = (speakerId: number) => {
    const email = forceLinkIds[speakerId];
    if (email && email.trim()) {
      forceLinkSpeaker.mutate(
        { speakerId, email: email.trim() },
        {
          onSuccess: () => {
            toast.success(`Successfully linked to ${email}`);
            setShowForceLink(null);
            setForceLinkIds({ ...forceLinkIds, [speakerId]: '' });
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.detail || 'Failed to link by email');
          }
        }
      );
    }
  };

  const handleConfirmProposal = (proposal: SpeakerReviewProposal) => {
    processReview.mutate(
      { speakerId: proposal.speaker_mapping_id, proposalId: proposal.id, action: 'confirm' },
      {
        onSuccess: () => toast.success(`Confirmed: ${proposal.proposed_name}`),
        onError: () => toast.error('Failed to confirm proposal'),
      }
    );
  };

  const handleDismissProposal = (proposal: SpeakerReviewProposal) => {
    processReview.mutate(
      { speakerId: proposal.speaker_mapping_id, proposalId: proposal.id, action: 'dismiss' },
      {
        onSuccess: () => toast.success('Proposal dismissed'),
        onError: () => toast.error('Failed to dismiss proposal'),
      }
    );
  };

  // 'Correct' = reject the proposed name, then open the edit form so user can type the right name.
  const handleCorrectProposal = (proposal: SpeakerReviewProposal) => {
    const speaker = speakers?.find((s: Speaker) => s.id === proposal.speaker_mapping_id);
    processReview.mutate(
      { speakerId: proposal.speaker_mapping_id, proposalId: proposal.id, action: 'correct' },
      {
        onSuccess: () => {
          if (speaker) handleEdit(speaker);
          toast.info('Proposal rejected — enter the correct name below');
        },
        onError: () => toast.error('Failed to update proposal'),
      }
    );
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <p className="text-center text-destructive">Error loading speakers</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Speakers</h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const hasReviewQueue = reviewQueue && reviewQueue.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Speakers to Review ── */}
      {hasReviewQueue && (
        <Card className="p-6 border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Speakers to Review ({reviewQueue.length})</h3>
          </div>
          <div className="space-y-3">
            {reviewQueue.map((proposal: SpeakerReviewProposal) => (
              <div key={proposal.id} className="flex flex-col rounded-lg border border-amber-200/60 bg-background p-4 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Review Proposed Match</p>
                    <p className="text-sm text-foreground">Proposed Name: <span className="font-medium text-primary">{proposal.proposed_name}</span></p>
                    {proposal.evidence_snippet && (
                      <p className="text-xs text-muted-foreground italic mt-2 border-l-2 pl-2 border-amber-200">"{proposal.evidence_snippet}"</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 h-8"
                      disabled={processReview.isPending}
                      onClick={() => handleConfirmProposal(proposal)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={processReview.isPending}
                      onClick={() => handleCorrectProposal(proposal)}
                    >
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Correct
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                      disabled={processReview.isPending}
                      onClick={() => handleDismissProposal(proposal)}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Dismiss
                    </Button>
                  </div>
                </div>
                {onSeek && proposal.evidence_timestamp !== null && (
                  <Button variant="secondary" size="sm" onClick={() => onSeek(proposal.evidence_timestamp!)} className="w-fit h-7 text-xs">
                    <Play className="h-3 w-3 mr-1.5" /> Play Evidence
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Confirmed Speakers ── */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">{hasReviewQueue ? 'Confirmed Speakers' : 'Speakers'} ({speakers?.length || 0})</h3>
        <div className="space-y-3">
          {(!speakers || speakers.length === 0) ? (
            <p className="text-center text-muted-foreground">No speakers identified in this meeting</p>
          ) : speakers.map((speaker: Speaker) => (
            <div
              key={speaker.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4 sm:gap-0 transition-colors hover:bg-muted/10"
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
                          className="w-full h-8"
                          disabled={
                            updateSpeaker.isPending || linkSpeaker.isPending || unlinkSpeaker.isPending
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
                        <Button size="sm" onClick={() => handleSave(speaker.id)} disabled={!editName.trim() || updateSpeaker.isPending} className="h-8 w-8 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateSpeaker.isPending} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : showForceLink === speaker.id ? (
                     <div className="flex items-center gap-2 mt-1">
                        <Input 
                          placeholder="Email address"
                          type="email"
                          value={forceLinkIds[speaker.id] || ''}
                          onChange={e => setForceLinkIds({...forceLinkIds, [speaker.id]: e.target.value})}
                          className="h-8 w-48 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleForceLink(speaker.id);
                            if (e.key === 'Escape') setShowForceLink(null);
                          }}
                        />
                        <Button size="sm" onClick={() => handleForceLink(speaker.id)} disabled={forceLinkSpeaker.isPending} className="h-8 w-8 p-0">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowForceLink(null)} className="h-8 w-8 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                     </div>
                  ) : (
                    <>
                      <p className="font-semibold text-sm truncate text-foreground">{speaker.display_name}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                        {speaker.original_label}
                        {speaker.linked_user_id ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-medium bg-primary/10 text-primary">
                            <LinkIcon className="h-2.5 w-2.5" />
                            Account Linked
                          </span>
                        ) : (
                          speaker.known_speaker_id && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-medium bg-muted text-muted-foreground">
                              <LinkIcon className="h-2.5 w-2.5" />
                              Voice Matched
                            </span>
                          )
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {editingId !== speaker.id && showForceLink !== speaker.id && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(speaker)} className="h-8 px-2 text-xs">
                    <Edit2 className="mr-1.5 h-3 w-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowForceLink(speaker.id)} className="h-8 px-2 text-xs">
                    <Mail className="mr-1.5 h-3 w-3" /> {speaker.linked_user_id ? 'Relink' : 'Link Email'}
                  </Button>
                  {speaker.linked_user_id && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => unlinkSpeaker.mutate({ speakerId: speaker.id })} 
                      disabled={unlinkSpeaker.isPending} 
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <Unlink className="mr-1.5 h-3 w-3" /> Unlink
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => rematchSpeaker.mutate({ speakerId: 0 })} 
                    disabled={rematchSpeaker.isPending}
                    title="Rematch Voice"
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${rematchSpeaker.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
