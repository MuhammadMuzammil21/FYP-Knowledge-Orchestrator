'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Menu } from 'lucide-react';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { toggle } = useMobileMenu();

    // Don't show navbar on auth pages
    const isAuthPage = pathname?.startsWith('/login') ||
        pathname?.startsWith('/signup') ||
        pathname?.startsWith('/verify-email') ||
        pathname?.startsWith('/forgot-password') ||
        pathname?.startsWith('/reset-password');

    if (isAuthPage) return null;

    const isDashboard = pathname === '/dashboard';

    const getPageTitle = () => {
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname === '/meetings') return 'All Meetings';
        if (pathname === '/profile') return 'Profile';
        if (pathname === '/settings') return 'Settings';
        if (pathname?.startsWith('/meetings/')) return 'Meeting Details';
        return 'HarBaat AI';
    };

    return (
        <div className="flex h-16 items-center justify-between border-b border-border bg-card px-3 md:px-6">
            <div className="flex items-center gap-2 md:gap-4">
                {/* Mobile Hamburger Menu */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    className="md:hidden"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {!isDashboard && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                )}
                <h1 className="text-lg md:text-xl font-semibold">{getPageTitle()}</h1>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
            >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
            </Button>
        </div>
    );
}
