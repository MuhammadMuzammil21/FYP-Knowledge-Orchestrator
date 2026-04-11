'use client';

import { Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { acceptInvite } from '@/lib/api/teams';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { Team } from '@/types';

// The inner component reads params and search params
function InviteContent({ params }: { params: Promise<{ token: string }> }) {
  const { token: pathToken } = use(params);
  const searchParams = useSearchParams();

  // In case the token is passed as a query param instead of path param
  const token = decodeURIComponent(pathToken) || searchParams.get('token');

  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthenticated'>('loading');
  const [team, setTeam] = useState<Team | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session) {
      setStatus('unauthenticated');
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage('No invite token found in URL.');
      return;
    }

    const processInvite = async () => {
      try {
        const result = await acceptInvite(token);
        setTeam(result.team);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        // Extract error message generically
        const msg = error?.response?.data?.detail
          ? typeof error.response.data.detail === 'string'
            ? error.response.data.detail
            : error.response.data.detail[0]?.msg
          : error?.message || 'Invalid or expired invite token.';
        setErrorMessage(msg as string);
      }
    };

    processInvite();
  }, [token]);

  return (
    <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-2 pb-4 pt-8 px-8 text-center border-b border-border/50 bg-muted/20">
        <div className="flex justify-center mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[oklch(0.88_0.05_150)] to-[oklch(0.65_0.12_195)] shadow-sm">
            <Users className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Team Invitation</h1>
        <p className="text-sm text-muted-foreground">Join your workspace on HarBaat AI</p>
      </CardHeader>

      <CardContent className="p-8">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Validating your invitation...</p>
          </div>
        )}

        {status === 'success' && team && (
          <div className="flex flex-col items-center justify-center py-2 text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">You're in!</h2>
              <p className="text-sm text-muted-foreground">
                You've successfully joined <strong>{team.name}</strong>.
              </p>
            </div>
            <Link href={`/teams/${team.slug}`} className="w-full mt-2">
              <Button className="w-full gap-2 font-medium">
                Go to team
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="flex flex-col items-center justify-center py-2 text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Authentication Required</h2>
              <p className="text-sm text-muted-foreground px-4">
                You must be logged in to accept this team invitation.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              <Link href={`/login?callbackUrl=/invite/${token}`} className="w-full">
                <Button className="w-full gap-2 font-medium">
                  <LogIn className="h-4 w-4" />
                  Log In
                </Button>
              </Link>
              <Link href={`/signup?callbackUrl=/invite/${token}`} className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-2 text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Invitation Failed</h2>
              <p className="text-sm text-destructive px-4">{errorMessage}</p>
            </div>
            <Link href="/dashboard" className="w-full mt-2">
              <Button variant="outline" className="w-full">
                Back to dashboard
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Ensure the icon doesn't break if Users wasn't imported properly
import { Users } from 'lucide-react';

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-200 h-200 bg-[radial-gradient(ellipse_at_center,oklch(0.88_0.05_150/0.1),transparent_70%)] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={
            <Card className="w-full h-100 flex items-center justify-center border-border/50 bg-card/95">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
          }
        >
          <InviteContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
