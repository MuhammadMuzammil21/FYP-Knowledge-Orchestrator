'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { NavbarWrapper } from '@/components/layout/NavbarWrapper';
import { useState } from 'react';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <WorkspaceProvider>
          <NavbarWrapper />
          {children}
          <Toaster />
        </WorkspaceProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
