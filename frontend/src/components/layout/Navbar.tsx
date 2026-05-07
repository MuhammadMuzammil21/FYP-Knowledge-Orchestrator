'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight, Search, HelpCircle, Menu } from 'lucide-react';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import { NotificationMenu } from './NotificationMenu';
import Link from 'next/link';

export function Navbar() {
  const pathname = usePathname();
  const { toggle } = useMobileMenu();

  // Don't show navbar on auth pages
  const isAuthPage = [
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ].some((route) => pathname?.startsWith(route));
  if (isAuthPage) return null;

  // Breadcrumb builder
  const getBreadcrumbs = (): { label: string; href?: string }[] => {
    if (pathname === '/dashboard') return [{ label: 'Dashboard' }];
    if (pathname === '/meetings') return [{ label: 'Meetings' }];
    if (pathname === '/projects') return [{ label: 'Projects' }];
    if (pathname === '/settings') return [{ label: 'Settings' }];
    if (pathname === '/profile') return [{ label: 'Profile' }];
    if (pathname?.startsWith('/meetings/') && pathname.endsWith('/graph'))
      return [
        { label: 'Meetings', href: '/meetings' },
        { label: 'Meeting', href: pathname.replace('/graph', '') },
        { label: 'Graph' },
      ];
    if (pathname?.startsWith('/meetings/'))
      return [{ label: 'Meetings', href: '/meetings' }, { label: 'Meeting detail' }];
    if (pathname?.startsWith('/projects/') && pathname.endsWith('/graph'))
      return [
        { label: 'Projects', href: '/projects' },
        { label: 'Project', href: pathname.replace('/graph', '') },
        { label: 'Graph' },
      ];
    if (pathname?.startsWith('/projects/') && pathname.endsWith('/conflicts'))
      return [
        { label: 'Projects', href: '/projects' },
        { label: 'Project', href: pathname.replace('/conflicts', '') },
        { label: 'Conflicts' },
      ];
    if (pathname?.startsWith('/projects/'))
      return [{ label: 'Projects', href: '/projects' }, { label: 'Project' }];
    if (pathname === '/teams') return [{ label: 'Teams' }];
    if (pathname === '/teams/create')
      return [{ label: 'Teams', href: '/teams' }, { label: 'Create team' }];
    if (pathname?.startsWith('/teams/'))
      return [{ label: 'Teams', href: '/teams' }, { label: 'Team' }];
    if (pathname?.startsWith('/settings/known-speakers'))
      return [{ label: 'Settings', href: '/settings' }, { label: 'Known speakers' }];
    return [{ label: 'HarBaat AI' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-sm px-4 md:px-6 shrink-0 shadow-sm dark:shadow-none">
      {/* Left zone */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="lg:hidden h-8 w-8 text-muted-foreground"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-foreground truncate max-w-[140px] sm:max-w-none">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right zone — icon actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Search"
          title="Search (⌘K)"
        >
          <Search className="h-4 w-4" />
        </Button>
        <NotificationMenu />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Help"
          title="Help & documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
