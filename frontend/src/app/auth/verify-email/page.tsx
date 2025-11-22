'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '../../../lib/api/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    } else {
      setIsLoading(false);
      setError('No verification token provided');
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.verifyEmail(verificationToken);
      setIsVerified(true);
      toast.success('Email verified', {
        description: 'Your email has been successfully verified.',
      });
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to verify email. The link may have expired.');
      toast.error('Verification failed', {
        description: error.response?.data?.detail || 'Failed to verify email.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    // We need the email, but we don't have it from the token
    // In a real app, we'd extract it from the token or ask the user
    toast.info('Resend verification', {
      description: 'Please use the resend link from your profile or sign in page.',
    });
    router.push('/auth/signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Verifying Email</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Email Verified</CardTitle>
            <CardDescription className="text-center">
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You can now use all features of the application.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/auth/signin">
                <Button className="w-full">Go to Sign In</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Go to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verification Failed</CardTitle>
          <CardDescription className="text-center">
            {error || 'Unable to verify your email address'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            The verification link may have expired or is invalid. Please request a new verification email.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleResendVerification} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Request New Verification Link
            </Button>
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

