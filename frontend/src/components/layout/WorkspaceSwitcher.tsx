'use client';

import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTeams } from '@/hooks/useTeams';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, Check, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import type { Team } from '@/types';

export function WorkspaceSwitcher() {
  const { workspace, setWorkspace, isTeamWorkspace } = useWorkspace();
  const { data: teams } = useTeams();

  const activeLabel = isTeamWorkspace ? (workspace as Team).name : 'Personal Workspace';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-accent/60 transition-colors duration-150 group border border-transparent hover:border-border">
          <div className="h-5 w-5 rounded flex items-center justify-center bg-primary/10 flex-shrink-0">
            <Users className="h-3 w-3 text-primary" />
          </div>
          <span className="flex-1 truncate text-left text-sm">{activeLabel}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 opacity-60 group-hover:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setWorkspace('personal')}
          className="flex items-center justify-between"
        >
          <span>Personal Workspace</span>
          {!isTeamWorkspace && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>

        {teams && teams.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => setWorkspace(team)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{team.name}</span>
                {isTeamWorkspace && (workspace as Team).id === team.id && (
                  <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/teams" className="flex items-center gap-2 text-primary">
            <Plus className="h-3.5 w-3.5" />
            Create or join a team
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
