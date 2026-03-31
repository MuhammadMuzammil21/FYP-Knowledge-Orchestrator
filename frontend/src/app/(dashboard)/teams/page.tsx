'use client';

import Link from 'next/link';
import { useTeams } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { TeamCard } from '@/components/teams/TeamCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users } from 'lucide-react';

export default function TeamsPage() {
    const { data: teams, isLoading, error } = useTeams();

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6 md:space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Teams</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Collaborate with your team on shared meeting projects
                    </p>
                </div>
                <Link href="/teams/create">
                    <Button className="w-full sm:w-auto gap-2 shadow-sm shadow-[oklch(0.88_0.05_150/0.25)]">
                        <Plus className="h-4 w-4" />
                        New team
                    </Button>
                </Link>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive font-medium">
                        Failed to load teams: {error.message || 'Unknown error occurred'}
                    </p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[180px] rounded-xl" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && teams?.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 rounded-xl border border-dashed border-border bg-card/50">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Create a team to start collaborating with others on shared meetings and projects.
                    </p>
                    <Link href="/teams/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create a team
                        </Button>
                    </Link>
                </div>
            )}

            {/* Teams Grid */}
            {!isLoading && teams && teams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {teams.map((team) => (
                        <TeamCard key={team.id} team={team} />
                    ))}
                </div>
            )}
        </div>
    );
}
