'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { User, Lock, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(session?.user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateProfile({ name });
            await update();
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement password change API
            toast.info('Password change feature coming soon');
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    if (!session) {
        router.push('/login');
        return null;
    }

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
                    <p className="text-gray-600">Manage your account preferences</p>
                </div>

                <Tabs defaultValue="account" className="space-y-6">
                    <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 scrollbar-hide">
                        <TabsTrigger value="account" className="flex-1 min-w-[100px]">
                            <User className="mr-2 h-4 w-4" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex-1 min-w-[100px]">
                            <Lock className="mr-2 h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex-1 min-w-[120px]">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex-1 min-w-[110px]">
                            <Palette className="mr-2 h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                    </TabsList>

                    {/* Account Tab */}
                    <TabsContent value="account">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Settings</CardTitle>
                                <CardDescription>
                                    Update your account information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={session.user.email}
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage your password and security preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Updating...' : 'Change Password'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Manage how you receive notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Email Notifications</p>
                                            <p className="text-sm text-gray-600">
                                                Receive email updates about your meetings
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Coming Soon
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Meeting Reminders</p>
                                            <p className="text-sm text-gray-600">
                                                Get notified when meetings are processed
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Coming Soon
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance Settings</CardTitle>
                                <CardDescription>
                                    Customize how the app looks
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Theme</p>
                                            <p className="text-sm text-gray-600">
                                                Choose your preferred color theme
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Light Mode
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Language</p>
                                            <p className="text-sm text-gray-600">
                                                Select your preferred language
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            English
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
