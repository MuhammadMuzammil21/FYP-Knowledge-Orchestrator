'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
    Plus,
    Calendar,
    Settings,
    LogOut,
    User,
    Folder
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r bg-card overflow-y-auto flex">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 shrink-0">
                <h1 className="text-xl font-bold text-foreground">HarBaat AI</h1>
                <ThemeToggle />
            </div>

            <Separator />

            {/* New Meeting Button */}
            <div className="p-4">
                <Link href="/dashboard">
                    <Button className="w-full" size="lg">
                        <Plus className="mr-2 h-5 w-5" />
                        New Meeting
                    </Button>
                </Link>
            </div>

            {/* Today Section */}
            <div className="flex-1 overflow-y-auto px-4">
                <div className="mb-2 flex items-center text-sm font-medium text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Today
                </div>
                <div className="space-y-1">
                    <Link
                        href="/meetings"
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${isActive('/meetings')
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                    >
                        All Meetings
                    </Link>
                    <Link
                        href="/projects"
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${isActive('/projects') || pathname?.startsWith('/projects/')
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                    >
                        <div className="flex items-center">
                            <Folder className="mr-2 h-4 w-4" />
                            Projects
                        </div>
                    </Link>
                </div>
            </div>

            <Separator />

            {/* Footer - Settings Only */}
            <div className="p-4">
                <Link
                    href="/settings"
                    className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${isActive('/settings')
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Link>
            </div>

            <Separator />

            {/* User Menu */}
            <div className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            <span className="truncate">{session?.user?.name || 'User'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
