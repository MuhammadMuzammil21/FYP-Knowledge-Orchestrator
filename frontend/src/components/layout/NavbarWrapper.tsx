'use client';

import { Navbar } from '@/components/layout/Navbar';
import { usePathname } from 'next/navigation';

const HIDE_NAVBAR_PATHS = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
];

export function NavbarWrapper() {
  const pathname = usePathname();

  // Don't show navbar on auth pages or landing page
  const hideNavbar =
    pathname === '/' || HIDE_NAVBAR_PATHS.some((route) => pathname?.startsWith(route));

  if (hideNavbar) return null;

  return <Navbar />;
}
