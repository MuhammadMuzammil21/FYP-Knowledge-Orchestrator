'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, User, Mail, Calendar, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { authApi, type UserProfile } from '@/lib/api/auth';
import { formatDate } from '@/lib/utils/formatters';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;

    setIsFetching(true);
    try {
      const userProfile = await authApi.getProfile(session.user.id);
      setProfile(userProfile);
      setFormData({
        name: userProfile.name,
        email: userProfile.email,
      });
    } catch (error: any) {
      toast.error('Failed to load profile', {
        description: error.response?.data?.detail || 'Could not fetch your profile.',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsLoading(true);

    try {
      const updatedProfile = await authApi.updateProfile(session.user.id, {
        name: formData.name,
        email: formData.email,
      });

      setProfile(updatedProfile);
      setIsEditing(false);
      
      // If email was changed, reset verification status
      if (formData.email !== profile.email) {
        toast.info('Email changed', {
          description: 'Please verify your new email address.',
        });
      }

      // Update NextAuth session
      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedProfile.name,
          email: updatedProfile.email,
        },
      });

      toast.success('Profile updated', {
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast.error('Update failed', {
        description: error.response?.data?.detail || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
      });
    }
    setIsEditing(false);
  };

  const handleResendVerification = async () => {
    if (!profile) return;

    setIsResending(true);
    try {
      const response = await authApi.resendVerification(profile.email);
      
      toast.success('Verification email sent', {
        description: response.message,
      });

      // In development, show the token
      if (response.token) {
        console.log('Verification token (dev only):', response.token);
        toast.info('Development Mode', {
          description: `Token: ${response.token.substring(0, 20)}...`,
        });
      }
    } catch (error: any) {
      toast.error('Failed to send verification email', {
        description: error.response?.data?.detail || 'Please try again later.',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Failed to load profile</p>
              <Button onClick={fetchProfile}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            <CardDescription>Manage your account information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing || isLoading}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing || isLoading}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Verification Status</Label>
                  <div className="flex items-center gap-2">
                    {profile.email_verified ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Not Verified
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResending}
                        >
                          {isResending ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3" />
                              Resend Verification
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {!profile.email_verified && (
                    <p className="text-xs text-muted-foreground">
                      Please verify your email to access all features. Check your inbox for the verification link.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={formatDate(profile.created_at)}
                      disabled
                      className="pl-9 bg-muted"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

