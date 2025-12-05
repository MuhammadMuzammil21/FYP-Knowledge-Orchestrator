'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Calendar,
    Settings,
    LogOut,
    User
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
        <div className="flex h-screen w-64 flex-col border-r bg-white">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4">
                <h1 className="text-xl font-bold">HarBaat AI</h1>
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
                <div className="mb-2 flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Today
                </div>
                <div className="space-y-1">
                    <Link
                        href="/meetings"
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${isActive('/meetings')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All Meetings
                    </Link>
                </div>
            </div>

            <Separator />

            {/* Footer - Settings Only */}
            <div className="p-4">
                <Link
                    href="/settings"
                    className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${isActive('/settings')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
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
                                <p className="text-xs text-gray-500">{session?.user?.email}</p>
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
        </div>
    );
}
