'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  Plus,
  Settings,
  LogOut,
  User,
  X,
  ChevronsUpDown,
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Users,
  MessageSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  exact,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || (href !== '/dashboard' && pathname?.startsWith(href + '/'));

  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
          'border-l-2',
          isActive
            ? 'border-primary bg-primary/15 text-primary font-medium dark:bg-primary/10'
            : 'border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:border-border'
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 flex-shrink-0',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
        <span className="flex-1 truncate">{label}</span>
        {badge !== undefined && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const { isOpen, close } = useMobileMenu();
  const { can } = useWorkspace();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-border bg-card flex',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:z-40'
        )}
      >
        {/* Header zone */}
        <div className="flex h-14 items-center justify-between px-4 shrink-0 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.88_0.05_150)] to-[oklch(0.65_0.12_195)] shadow-sm">
              <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">HarBaat AI</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="md:hidden h-8 w-8"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* New Meeting CTA */}
        {can('upload_meeting') && (
          <div className="p-3 shrink-0">
            <Link href="/dashboard" onClick={close}>
              <Button
                className="w-full justify-start gap-2 h-9 shadow-sm shadow-[oklch(0.88_0.05_150/0.25)]"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New meeting
              </Button>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-1 pt-3 pb-2">
            <WorkspaceSwitcher />
          </div>
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={close} />
          <NavItem href="/meetings" icon={Calendar} label="All meetings" onClick={close} />
          <NavItem href="/projects" icon={FolderOpen} label="Projects" onClick={close} />
          <NavItem href="/teams" icon={Users} label="Teams" onClick={close} />

          <Separator className="my-3" />

          <p className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase select-none">
            Account
          </p>
          <NavItem href="/settings" icon={Settings} label="Settings" exact onClick={close} />
          <NavItem
            href="/settings/known-speakers"
            icon={Users}
            label="Known speakers"
            onClick={close}
          />
        </div>

        {/* User menu zone */}
        <div className="border-t border-border p-3 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-accent transition-colors duration-150 group">
                {/* Avatar circle with initials */}
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[11px] font-semibold flex-shrink-0">
                  {session?.user?.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() ?? 'U'}
                </div>
                {/* Name + email */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium leading-none truncate">
                    {session?.user?.name ?? 'User'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {session?.user?.email ?? ''}
                  </p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-1">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{session?.user?.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {session?.user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
