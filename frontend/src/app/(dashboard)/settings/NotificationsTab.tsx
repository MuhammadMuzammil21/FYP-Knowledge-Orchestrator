'use client';

import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Mail, MessageSquare, Info } from 'lucide-react';
import type { NotificationPreferences } from '@/types';

// Accessible toggle switch component
function ToggleSwitch({
  id,
  checked,
  onCheckedChange,
  disabled,
}: {
  id?: string;
  checked?: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                ${checked ? 'bg-primary' : 'bg-input'}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform
                    ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

interface PreferenceRowProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  checked?: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}

function PreferenceRow({
  id,
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: PreferenceRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
        <div className="space-y-0.5 min-w-0">
          <Label htmlFor={id} className="text-base cursor-pointer">
            {label}
          </Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">
        <ToggleSwitch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function NotificationsTab() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggle = (key: keyof NotificationPreferences) => (checked: boolean) => {
    if (!preferences) return;
    updatePreferences.mutate({ [key]: checked });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>Choose which events trigger notifications in HarBaat AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PreferenceRow
            id="notify_on_mention"
            icon={<MessageSquare className="h-4 w-4" />}
            label="Mentions &amp; Task Assignments"
            description="Get notified when you are mentioned or assigned a task in a meeting"
            checked={preferences?.notify_on_mention}
            onCheckedChange={handleToggle('notify_on_mention')}
            disabled={updatePreferences.isPending}
          />

          <Separator />

          <PreferenceRow
            id="notify_on_summary"
            icon={<Bell className="h-4 w-4" />}
            label="Meeting Summaries Ready"
            description="Get notified when a meeting has finished processing and a summary is available"
            checked={preferences?.notify_on_summary}
            onCheckedChange={handleToggle('notify_on_summary')}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure email alerts for critical events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PreferenceRow
            id="email_on_mention"
            icon={<Mail className="h-4 w-4" />}
            label="Email me for critical mentions"
            description="Receive an email when you are mentioned or assigned a task in a meeting"
            checked={preferences?.email_on_mention}
            onCheckedChange={handleToggle('email_on_mention')}
            disabled={updatePreferences.isPending}
          />

          {/* <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Email delivery is currently being set up. Toggling this preference will take effect
              once the email service is enabled.
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
