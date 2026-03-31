import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Team } from '@/types';

interface TeamCardProps {
    team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
    return (
        <Link href={`/teams/${team.slug}`} className="block group">
            <div className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/50 relative overflow-hidden flex flex-col h-[180px]">
                {/* Visual hover effect line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(0.88_0.05_150)] to-[oklch(0.65_0.12_195)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                </div>

                {/* Content */}
                <div className="mt-4 flex-1">
                    <h3 className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                        {team.name}
                    </h3>
                    {team.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                            {team.description}
                        </p>
                    )}
                </div>

                {/* Footer metadata */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                            {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-[10px] font-medium px-2 py-0 border-primary/20 bg-primary/5 text-primary">
                            {team.your_role}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5 duration-200" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
