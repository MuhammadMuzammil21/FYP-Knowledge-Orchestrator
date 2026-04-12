'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Check,
  Trash2,
  Settings,
  AlertCircle,
  Info,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import type { Notification } from '@/types/domain.types';
import { parseUTCDate } from '@/lib/utils/date';

function formatTimeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? parseUTCDate(dateInput) : dateInput;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Fetch count frequently
  const { data: countData } = useUnreadNotificationsCount();
  const unreadCount = countData?.count || 0;

  // Fetch full list only when opening the menu
  const { data, isLoading } = useNotifications(false);
  const notifications = data?.notifications || [];

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate if there's a link
    if (notification.extraData?.link) {
      setOpen(false);
      router.push(notification.extraData.link);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'summary':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'conflict':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'action_item':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={() => markAllAsRead.mutate()}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => {
                setOpen(false);
                router.push('/settings');
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 justify-center flex flex-col items-center text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-4 opacity-20" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">We'll notify you when something important happens.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
                  )}
                  <div className="mt-0.5 shrink-0 bg-background rounded-full border shadow-sm p-1">
                    {getIcon(notification.type)}
                  </div>
                  <div
                    className="flex flex-col gap-1 flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="text-sm leading-tight text-wrap break-words">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification.mutate(notification.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                router.push('/settings');
              }}
            >
              View Preferences
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
