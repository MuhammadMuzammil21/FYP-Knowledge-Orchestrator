'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  useTeam,
  useTeamInvites,
  useInviteMember,
  useRevokeInvite,
  useUpdateMemberRole,
  useRemoveMember,
  useUpdateTeam,
  useDeleteTeam,
  useTeamDashboard,
} from '@/hooks/useTeams';
import { useProjects } from '@/hooks/useProjects';
import { createProject } from '@/lib/api/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Mail,
  Users,
  Settings,
  LayoutDashboard,
  FolderOpen,
  Mic,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import type { TeamRole } from '@/types';

export default function TeamDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { can, activeTeamRole, setWorkspace, workspace, isTeamWorkspace } = useWorkspace();
  const { slug } = use(params);
  const router = useRouter();

  // Data hooks
  const { data: team, isLoading: isTeamLoading } = useTeam(slug);
  const { data: invites, isLoading: isInvitesLoading } = useTeamInvites(slug);
  const { data: dashboard } = useTeamDashboard(slug);
  const { data: teamProjects, isLoading: isProjectsLoading, refetch: refetchProjects } = useProjects(team?.id);

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

  // Sync workspace on load
  useEffect(() => {
    if (team && (!isTeamWorkspace || (workspace as any).id !== team.id)) {
      setWorkspace(team);
    }
  }, [team, workspace, isTeamWorkspace, setWorkspace]);

  const handleRemoveMember = (userId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
      removeMember.mutate(userId);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMember.mutate(
      { email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => setInviteEmail(''),
      }
    );
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
      },
    });
  };

  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !team) return;
    setIsCreatingProject(true);
    try {
      await createProject({
        name: newProjectName,
        description: newProjectDesc,
        team_id: team.id,
      });
      setNewProjectName('');
      setNewProjectDesc('');
      setIsNewProjectDialogOpen(false);
      refetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  if (isTeamLoading)
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-300 mx-auto w-full">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );

  if (!team)
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Team not found.</p>
      </div>
    );


  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{team.name}</h1>
            <Badge variant="outline" className="capitalize border-primary/20 bg-primary/5 text-primary">
              {team.your_role}
            </Badge>
          </div>
          {team.description && <p className="text-sm text-muted-foreground">{team.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {can('manage_settings') && (
            <Button variant="outline" onClick={() => setIsManageDialogOpen(true)} className="gap-2">
              <Settings className="h-4 w-4" /> Manage Team
            </Button>
          )}
          {can('upload_meeting') && (
            <Link href="/dashboard">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Meeting
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: Activity & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-sm">Team Stats</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm">Projects</span>
                </div>
                <span className="font-medium">{dashboard?.projects_count ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm">Meetings</span>
                </div>
                <span className="font-medium">{dashboard?.meetings_count ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Members</span>
                </div>
                <span className="font-medium">{team.members?.length ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Projects */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Projects</h3>
            {can('manage_settings') && (
              <Button onClick={() => setIsNewProjectDialogOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> New Project
              </Button>
            )}
          </div>

          {isProjectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : teamProjects && teamProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamProjects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <h4 className="font-semibold mb-1">No team projects yet</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Projects are where your team's meetings and insights are stored.
              </p>
              {can('manage_settings') && (
                <Button onClick={() => setIsNewProjectDialogOpen(true)} variant="outline">
                  Create First Project
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NEW PROJECT DIALOG */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team Project</DialogTitle>
            <DialogDescription>
              This project will be visible to all members of {team.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project Name</Label>
              <Input
                id="proj-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Client Alpha"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">Description (Optional)</Label>
              <Input
                id="proj-desc"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Brief overview of the project"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewProjectDialogOpen(false)} disabled={isCreatingProject}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingProject || !newProjectName}>
                {isCreatingProject && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MANAGE TEAM DIALOG */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <DialogTitle>Manage Team</DialogTitle>
              <DialogDescription>
                Members, invites, and settings for {team.name}.
              </DialogDescription>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col p-6">
            <Tabs defaultValue="members" className="w-full flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-3 shrink-0">
                <TabsTrigger value="members">
                  <Users className="w-4 h-4 mr-2" /> Members
                </TabsTrigger>
                <TabsTrigger value="invites">
                  <Mail className="w-4 h-4 mr-2" /> Invites
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4 px-1 pb-4 space-y-4">
                {/* MEMBERS TAB */}
                <TabsContent value="members" className="m-0 h-full">
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="divide-y divide-border">
                      {team.members.map((member: any) => (
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
                              >
                                <SelectTrigger className="w-27.5 h-8 text-xs">
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
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => handleRemoveMember(member.user_id, member.name)}
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
                <TabsContent value="invites" className="m-0 space-y-4">
                  {can('manage_members') && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <form onSubmit={handleInviteSubmit} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Email</Label>
                          <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="h-9" />
                        </div>
                        <div className="w-32 space-y-1">
                          <Label className="text-xs">Role</Label>
                          <Select value={inviteRole} onValueChange={(val: TeamRole) => setInviteRole(val)}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" disabled={inviteMember.isPending || !inviteEmail} className="h-9">
                          {inviteMember.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                          Invite
                        </Button>
                      </form>
                    </div>
                  )}

                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="p-3 border-b border-border bg-muted/30">
                      <h3 className="text-sm font-semibold">Pending Invites</h3>
                    </div>
                    {isInvitesLoading ? (
                      <div className="p-4"><Skeleton className="h-10 w-full" /></div>
                    ) : (invites && invites.length > 0) ? (
                      <div className="divide-y divide-border">
                        {invites.map((invite: any) => (
                          <div key={invite.id} className="p-3 flex items-center justify-between text-sm">
                            <span className="font-medium">{invite.email}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize text-xs font-normal">{invite.role}</Badge>
                              {can('manage_members') && (
                                <Button variant="ghost" size="sm" className="text-destructive h-7 px-2 text-xs" onClick={() => revokeInvite.mutate(invite.id)}>
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-muted-foreground">No pending invites.</div>
                    )}
                  </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="m-0 space-y-6">
                  {!can('manage_settings') ? (
                    <div className="text-center p-8 text-muted-foreground"><Settings className="h-10 w-10 mx-auto mb-2 opacity-20"/> No permission</div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Team Details</h4>
                        <form onSubmit={handleUpdateTeam} className="space-y-3">
                          <div className="space-y-1">
                            <Label>Name</Label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <Label>Description</Label>
                            <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                          </div>
                          <Button type="submit" disabled={updateTeam.isPending}>Save changes</Button>
                        </form>
                      </div>

                      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 mt-8">
                        <h4 className="font-semibold text-destructive mb-1 text-sm">Danger Zone</h4>
                        <p className="text-xs text-muted-foreground mb-4">Permanently delete this team and all data.</p>
                        <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>Delete Team</Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* DELETE DIALOG (Nested outside manage dialog) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete "{team.name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={deleteTeam.isPending}>
              Yes, delete team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
