import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationPreferences,
    updateNotificationPreferences,
} from '@/lib/api/users';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';
import type { NotificationPreferences } from '@/types';

export function useNotifications(unreadOnly = false) {
    return useQuery({
        queryKey: ['notifications', { unreadOnly }],
        queryFn: () => getNotifications(unreadOnly),
        staleTime: 60 * 1000,
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
}

export function useUnreadNotificationsCount() {
    return useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: getUnreadNotificationsCount,
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000, // Refetch every 1 minute
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
            toast.success('All notifications marked as read');
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
}

export function useNotificationPreferences() {
    return useQuery({
        queryKey: ['notification-preferences'],
        queryFn: getNotificationPreferences,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (preferences: Partial<NotificationPreferences>) => updateNotificationPreferences(preferences),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
            toast.success('Notification preferences updated');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
