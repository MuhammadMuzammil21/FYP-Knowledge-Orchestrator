'use client';

import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/layout/UserMenu';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingNavbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user ? {
    name: session.user.name || '',
    email: session.user.email || '',
    avatarUrl: session.user.image || undefined,
  } : null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left — Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-sm btn-shimmer">
            <MessageSquare className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-display font-semibold tracking-tight">HarBaat AI</span>
        </Link>

        {/* Center — Nav Links (desktop) */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu user={user} />
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden transition-transform"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={cn(
        "lg:hidden absolute top-16 left-0 right-0 w-full z-[60] bg-background border-t border-border transition-all duration-300 overflow-hidden",
        mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-3.5 px-4 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-3.5 px-4 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button className="w-full mt-1 btn-shimmer" size="lg">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
