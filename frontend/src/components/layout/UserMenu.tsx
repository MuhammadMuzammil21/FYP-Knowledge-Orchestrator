'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCircle2, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return (
      <>
        <Link href="/login" className="hidden lg:inline-flex">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href="/signup" className="flex-shrink-0">
          <Button size="sm" className="btn-shimmer">
            Get started
          </Button>
        </Link>
      </>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-[36px] w-[36px] items-center justify-center rounded-full bg-zinc-900 focus:outline-none transition-all cursor-pointer",
          (isOpen || "hover:ring-2 hover:ring-[#2DD4BF] hover:ring-offset-2 hover:ring-offset-background"),
          isOpen && "ring-2 ring-[#2DD4BF] ring-offset-2 ring-offset-background"
        )}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover rounded-full" />
        ) : initials ? (
          <span className="text-[#2DD4BF] text-sm font-semibold">{initials}</span>
        ) : (
          <UserCircle2 className="h-5 w-5 text-zinc-400" />
        )}
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] w-[220px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 origin-top-right transition-all duration-150 ease-out z-50",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover rounded-full" />
            ) : initials ? (
              <span className="text-[#2DD4BF] text-sm font-semibold">{initials}</span>
            ) : (
              <UserCircle2 className="h-6 w-6 text-zinc-400" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{user.name}</span>
            <span className="text-xs text-zinc-400 truncate">{user.email}</span>
          </div>
        </div>

        <div className="border-b border-zinc-800 mt-2 mb-2" />

        {/* Menu Items */}
        <div className="flex flex-col">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          
          <div className="border-b border-zinc-800 mt-2 mb-2" />
          
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: '/' });
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
