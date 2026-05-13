'use client';

import { useState } from 'react';
import {
  useKnownSpeakers,
  useDeleteKnownSpeaker,
  useUpdateKnownSpeaker,
  useUnlinkedPrompts,
  useMarkExternalSpeaker,
  useLinkKnownSpeakerAccount,
  useCreateKnownSpeaker,
} from '@/hooks/useKnownSpeakers';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTeam } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Trash2, Edit2, Check, X, AlertCircle, Link as LinkIcon, UserPlus, ShieldPlus } from 'lucide-react';
import type { KnownSpeaker, UnlinkedSpeakerPrompt } from '@/types';
import { toast } from 'sonner';

export default function KnownSpeakersPage() {
  const { activeTeamSlug } = useWorkspace();
  const { data: teamDetail } = useTeam(activeTeamSlug || '');

  const { data: speakers, isLoading, error } = useKnownSpeakers();
  const { data: unlinkedPrompts, isLoading: promptsLoading } = useUnlinkedPrompts();
  
  const deleteSpeaker = useDeleteKnownSpeaker();
  const updateSpeaker = useUpdateKnownSpeaker();
  const linkAccount = useLinkKnownSpeakerAccount();
  const markExternal = useMarkExternalSpeaker();
  const createSpeaker = useCreateKnownSpeaker();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  
  // prompt states
  const [linkingPromptId, setLinkingPromptId] = useState<number | null>(null);
  const [linkingUserId, setLinkingUserId] = useState<string>('');

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

  const handleLinkAccount = (promptId: number, name: string) => {
    if (!linkingUserId) {
      toast.error('Please select a team member to link');
      return;
    }
    
    // In actual use, we would use dry_run to check or just link directly
    linkAccount.mutate({ 
      id: promptId, 
      data: { user_id: linkingUserId }
    }, {
      onSuccess: () => {
        setLinkingPromptId(null);
        setLinkingUserId('');
      }
    });
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

  const hasUnlinkedPrompts = unlinkedPrompts && unlinkedPrompts.length > 0;

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Known Speakers</h1>
        <p className="mt-2 text-muted-foreground">
          Manage speaker identities across all your meetings
        </p>
      </div>

      {/* ── Unlinked Prompts ── */}
      {hasUnlinkedPrompts && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">Action Needed: Unlinked Speakers</h2>
          </div>
          <p className="text-sm text-foreground">These frequent speakers have not been tied to a User Account nor marked as external.</p>
          
          <div className="space-y-4">
            {unlinkedPrompts.map((prompt: UnlinkedSpeakerPrompt) => (
              <Card key={prompt.id} className="p-5 border-amber-200/60 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-950/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{prompt.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Appears in {prompt.meeting_count} meeting{prompt.meeting_count !== 1 ? 's' : ''} • Current status: <span className="uppercase font-medium text-[10px] bg-muted px-1.5 py-0.5 rounded">{prompt.status}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {linkingPromptId === prompt.id ? (
                      <div className="flex items-center gap-2 bg-background p-1.5 rounded-md border">
                        <Select value={linkingUserId} onValueChange={setLinkingUserId}>
                          <SelectTrigger className="w-48 h-8 text-xs">
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamDetail?.members?.map((m) => (
                              <SelectItem key={m.user_id} value={m.user_id}>
                                {m.name || m.email}
                              </SelectItem>
                            ))}
                            {(!teamDetail || !teamDetail.members?.length) && (
                              <SelectItem value="none" disabled>No members available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <Button size="sm" className="h-8" onClick={() => handleLinkAccount(prompt.id, prompt.name)} disabled={!linkingUserId || linkAccount.isPending}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => { setLinkingPromptId(null); setLinkingUserId(''); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button size="sm" variant="default" onClick={() => setLinkingPromptId(prompt.id)} className="gap-2 h-8">
                          <LinkIcon className="h-3.5 w-3.5" /> Link Account
                        </Button>
                        <Button 
                           size="sm" 
                           variant="outline" 
                           onClick={() => markExternal.mutate(prompt.id)}
                           disabled={markExternal.isPending}
                           className="gap-2 h-8"
                        >
                          <ShieldPlus className="h-3.5 w-3.5" /> Mark External
                        </Button>
                        {/* If status is unmapped we might want to let them create it, but it IS a known speaker already. It says prompt.id */}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-8">All Known Speakers</h2>
      
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === speaker.id ? (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full sm:w-64"
                          disabled={updateSpeaker.isPending}
                          autoFocus
                        />
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
                        <h3 className="font-semibold text-lg truncate">{speaker.name}</h3>
                        <p className="text-sm text-muted-foreground truncate flex items-center gap-2 flex-wrap mt-0.5">
                          <span>Appears in {speaker.meeting_count} meeting{speaker.meeting_count !== 1 ? 's' : ''}</span>
                          {speaker.status && (
                            <>
                              <span>•</span>
                              <span className="uppercase text-[10px] tracking-wide font-medium bg-muted px-1.5 py-0.5 rounded">
                                {speaker.status}
                              </span>
                            </>
                          )}
                          {speaker.linked_user_email && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                                <LinkIcon className="h-3 w-3" />
                                {speaker.linked_user_email}
                              </span>
                            </>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {editingId !== speaker.id && (
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(speaker)}
                      className="flex-1 sm:flex-none h-8"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(speaker.id, speaker.name)}
                      disabled={deleteSpeaker.isPending}
                      className="flex-1 sm:flex-none h-8 text-destructive hover:bg-destructive/10"
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
        <div className="flex h-64 items-center justify-center border border-dashed rounded-lg">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-muted-foreground">No Known Speakers Yet</h2>
            <p className="text-sm text-muted-foreground/70">
              Known speakers are created automatically from meeting speakers
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
