'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { verifyEmail, resendVerification } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { Mail, CheckCircle2 } from 'lucide-react';
import { AuthBranding } from '@/components/auth/AuthBranding';

function VerifyEmailContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      await verifyEmail(verificationToken);
      setIsVerified(true);
      toast.success('Email verified successfully!');

      // Update session with a full refresh to pick up email_verified: true
      await update({ forceRefresh: true });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!session?.user?.email) {
      toast.error('No email found');
      return;
    }

    setIsResending(true);
    try {
      await resendVerification(session.user.email);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <AuthBranding />
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. Redirecting to dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <AuthBranding />
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              {token
                ? 'Verifying your email address...'
                : 'Please verify your email address to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!token && (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  We've sent a verification link to{' '}
                  <span className="font-semibold text-foreground">{session?.user?.email}</span>
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Click the link in the email to verify your account.
                </p>
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={async () => {
                      try {
                        const newSession = await update({ forceRefresh: true });
                        if (newSession?.user?.email_verified) {
                          toast.success('Email verified! Redirecting...');
                          router.push('/dashboard');
                        } else {
                          toast.info('Email not verified yet. Please check your inbox.');
                        }
                      } catch (error) {
                        toast.error('Failed to check verification status');
                        console.error('Update session error:', error);
                      }
                    }}
                    variant="default"
                    className="w-full"
                  >
                    Check Verification Status
                  </Button>
                  <Button
                    onClick={handleResend}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend verification email'}
                  </Button>
                </div>
              </>
            )}
            {isVerifying && (
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Verifying...</p>
              </div>
            )}
            {!token && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Already verified?{' '}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-primary hover:underline"
                >
                  Sign out and sign in again
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
