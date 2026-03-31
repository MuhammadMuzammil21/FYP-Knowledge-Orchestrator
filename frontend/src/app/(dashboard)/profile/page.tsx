'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { formatLongDate } from '@/lib/utils/date';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(session?.user?.name || '');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateProfile({ name });
            await update(); // Refresh session
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) {
        router.push('/login');
        return null;
    }

    const createdDate = session.user.created_at
        ? formatLongDate(session.user.created_at)
        : 'N/A';

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">Manage your account information</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={session.user.email}
                                            className="pl-10"
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground/70">
                                        Email cannot be changed
                                    </p>
                                </div>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Profile'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Account Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>
                                Your account information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Member Since</p>
                                        <p className="text-sm text-muted-foreground">{createdDate}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email Verification</p>
                                        <p className="text-sm text-muted-foreground">
                                            {session.user.email_verified ? (
                                                <span className="text-accent">Verified ✓</span>
                                            ) : (
                                                <span className="text-destructive/80">Not Verified</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 font-mono">
                                <div className="flex items-center gap-3 min-w-0">
                                    <User className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium font-sans">User ID</p>
                                        <p className="text-sm text-muted-foreground font-mono break-all pr-2">
                                            {session.user.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
