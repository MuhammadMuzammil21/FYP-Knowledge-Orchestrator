'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Team, TeamRole } from '@/types';

type Permission =
    | 'upload_meeting'
    | 'delete_meeting'
    | 'delete_project'
    | 'manage_members'
    | 'manage_settings';

interface WorkspaceContextType {
    workspace: 'personal' | Team;
    setWorkspace: (ws: 'personal' | Team) => void;
    isTeamWorkspace: boolean;
    activeTeamId: string | null;
    activeTeamSlug: string | null;
    activeTeamRole: TeamRole | null;
    can: (permission: Permission) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'harbaat_active_workspace';

const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
    owner: ['upload_meeting', 'delete_meeting', 'delete_project', 'manage_members', 'manage_settings'],
    admin: ['upload_meeting', 'delete_meeting', 'delete_project', 'manage_members'],
    member: ['upload_meeting', 'delete_meeting'],
    viewer: [],
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [workspace, setWorkspaceState] = useState<'personal' | Team>('personal');

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && stored !== 'personal') {
                setWorkspaceState(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    const setWorkspace = useCallback((ws: 'personal' | Team) => {
        setWorkspaceState(ws);
        try {
            localStorage.setItem(STORAGE_KEY, ws === 'personal' ? 'personal' : JSON.stringify(ws));
        } catch {
            // ignore storage errors
        }
    }, []);

    const isTeamWorkspace = workspace !== 'personal';
    const activeTeamId = isTeamWorkspace ? (workspace as Team).id : null;
    const activeTeamSlug = isTeamWorkspace ? (workspace as Team).slug : null;
    const activeTeamRole: TeamRole | null = isTeamWorkspace ? (workspace as Team).your_role : null;

    const can = useCallback((permission: Permission): boolean => {
        if (!isTeamWorkspace) {
            // Personal workspace: user owns everything
            return true;
        }
        if (!activeTeamRole) return false;
        return ROLE_PERMISSIONS[activeTeamRole].includes(permission);
    }, [isTeamWorkspace, activeTeamRole]);

    return (
        <WorkspaceContext.Provider value={{
            workspace, setWorkspace, isTeamWorkspace,
            activeTeamId, activeTeamSlug, activeTeamRole, can,
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
