'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTeam, useTeamInvites, useInviteMember, useRevokeInvite, useUpdateMemberRole, useRemoveMember, useUpdateTeam, useDeleteTeam } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Trash2, Mail, Users, Settings } from 'lucide-react';
import type { TeamRole } from '@/types';

export default function TeamDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { can, activeTeamRole } = useWorkspace();

    // Data hooks
    const { data: team, isLoading: isTeamLoading } = useTeam(slug);
    const { data: invites, isLoading: isInvitesLoading } = useTeamInvites(slug);

    // Mutation hooks
    const updateRole = useUpdateMemberRole(slug);
    const removeMember = useRemoveMember(slug);
    const inviteMember = useInviteMember(slug);
    const revokeInvite = useRevokeInvite(slug);
    const updateTeam = useUpdateTeam(slug);
    const deleteTeam = useDeleteTeam();

    // UI state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<TeamRole>('member');
    
    // Team edit state
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Initial sync
    useEffect(() => {
        if (team && !editName) {
            setEditName(team.name);
            setEditDesc(team.description || '');
        }
    }, [team, editName]);

    const handleRemoveMember = (userId: string, name: string) => {
        if (window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
            removeMember.mutate(userId);
        }
    };

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        inviteMember.mutate({ email: inviteEmail, role: inviteRole }, {
            onSuccess: () => setInviteEmail('')
        });
    };

    const handleUpdateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName) return;
        updateTeam.mutate({ name: editName, description: editDesc });
    };

    const handleDeleteTeam = () => {
        deleteTeam.mutate(slug, {
            onSuccess: () => {
                router.push('/teams');
            }
        });
    };

    if (isTeamLoading) return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
            <Skeleton className="h-4 w-32 mb-6" />
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
        </div>
    );

    if (!team) return (
        <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
            <p className="text-muted-foreground">Team not found.</p>
        </div>
    );

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto w-full space-y-6 md:space-y-8">
            <div>
                <Link
                    href="/teams"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to teams
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{team.name}</h1>
                    <Badge variant="outline" className="capitalize border-primary/20 bg-primary/5 text-primary">
                        {team.your_role}
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="members"><Users className="w-4 h-4 mr-2"/> Members</TabsTrigger>
                    <TabsTrigger value="invites"><Mail className="w-4 h-4 mr-2"/> Invites</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2"/> Settings</TabsTrigger>
                </TabsList>

                {/* MEMBERS TAB */}
                <TabsContent value="members" className="mt-6 space-y-4">
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold">Team Members</h3>
                            <p className="text-sm text-muted-foreground">Manage who has access to this team.</p>
                        </div>
                        <div className="divide-y divide-border">
                            {team.members.map((member) => (
                                <div key={member.user_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm leading-none">{member.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        {can('manage_members') && activeTeamRole === 'owner' && member.role !== 'owner' ? (
                                            <Select
                                                defaultValue={member.role}
                                                onValueChange={(val: TeamRole) => updateRole.mutate({ userId: member.user_id, role: val })}
                                                disabled={updateRole.isPending}
                                            >
                                                <SelectTrigger className="w-[110px] h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="viewer">Viewer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="secondary" className="capitalize text-xs font-normal">
                                                {member.role}
                                            </Badge>
                                        )}
                                        {can('manage_members') && member.role !== 'owner' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                                onClick={() => handleRemoveMember(member.user_id, member.name)}
                                                disabled={removeMember.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* INVITES TAB */}
                <TabsContent value="invites" className="mt-6 space-y-6">
                    {can('manage_members') && (
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="font-semibold mb-1">Invite Member</h3>
                            <p className="text-sm text-muted-foreground mb-4">Send an email invitation to join this team.</p>
                            <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <Input
                                        type="email"
                                        placeholder="Email address"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-[150px]">
                                    <Select value={inviteRole} onValueChange={(val: TeamRole) => setInviteRole(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={inviteMember.isPending || !inviteEmail}>
                                    {inviteMember.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Send invite
                                </Button>
                            </form>
                        </div>
                    )}

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold">Pending Invites</h3>
                        </div>
                        {isInvitesLoading ? (
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : invites && invites.length > 0 ? (
                            <div className="divide-y divide-border">
                                {invites.map((invite) => (
                                    <div key={invite.id} className="p-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-sm">{invite.email}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Expires: {new Date(invite.expires_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="capitalize text-xs font-normal">
                                                {invite.role}
                                            </Badge>
                                            {can('manage_members') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive h-8 px-2"
                                                    onClick={() => revokeInvite.mutate(invite.id)}
                                                    disabled={revokeInvite.isPending}
                                                >
                                                    Revoke
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                No pending invites.
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="mt-6">
                    {!can('manage_settings') ? (
                        <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center text-center">
                            <Settings className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="font-semibold text-lg">Access Denied</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                You do not have permission to view or manage team settings. Only team owners can access this section.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="font-semibold mb-1">Team Details</h3>
                                <p className="text-sm text-muted-foreground mb-6">Update your team's name and description.</p>
                                <form onSubmit={handleUpdateTeam} className="space-y-4 max-w-lg">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-name">Team name</Label>
                                        <Input
                                            id="edit-name"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-desc">Description</Label>
                                        <Input
                                            id="edit-desc"
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={updateTeam.isPending}>
                                        {updateTeam.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Save changes
                                    </Button>
                                </form>
                            </div>

                            <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6">
                                <h3 className="font-semibold text-destructive mb-1">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground mb-6">Permanently delete this team and all its data. This action cannot be undone.</p>
                                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                    Delete Team
                                </Button>
                            </div>

                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete the team
                                            "{team.name}" and remove all data associated with it.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="mt-4">
                                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteTeam.isPending}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleDeleteTeam} disabled={deleteTeam.isPending}>
                                            {deleteTeam.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Yes, delete team
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
