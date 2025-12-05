'use client';

import { Navbar } from '@/components/layout/Navbar';
import { usePathname } from 'next/navigation';

export function NavbarWrapper() {
    const pathname = usePathname();

    // Don't show navbar on auth pages
    const isAuthPage = pathname?.startsWith('/login') ||
        pathname?.startsWith('/signup') ||
        pathname?.startsWith('/verify-email') ||
        pathname?.startsWith('/forgot-password') ||
        pathname?.startsWith('/reset-password');

    if (isAuthPage) return null;

    return <Navbar />;
}
