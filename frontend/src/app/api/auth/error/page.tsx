'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Try Signing In Again</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/signup">Create New Account</Link>
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

