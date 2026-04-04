import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type { VoiceIdentityResponse, NotificationResponse, NotificationPreferences } from '@/types';

/**
 * VOICE IDENTITY ENDPOINTS
 */

export async function getVoiceIdentity(): Promise<VoiceIdentityResponse> {
  const response = await apiClient.get<VoiceIdentityResponse>(API_ENDPOINTS.USER_VOICE);
  return response.data;
}

export async function registerVoiceIdentity(audioData: Blob): Promise<VoiceIdentityResponse> {
  const formData = new FormData();
  formData.append('file', audioData, 'voice.webm');

  const response = await apiClient.post<VoiceIdentityResponse>(API_ENDPOINTS.USER_VOICE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteVoiceIdentity(): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.USER_VOICE);
}

/**
 * NOTIFICATIONS ENDPOINTS
 */

export async function getNotifications(
  unreadOnly = false
): Promise<{ notifications: NotificationResponse[] }> {
  const response = await apiClient.get<{ notifications: NotificationResponse[] }>(
    API_ENDPOINTS.USER_NOTIFICATIONS,
    { params: { unread_only: unreadOnly } }
  );
  return response.data;
}

export async function getUnreadNotificationsCount(): Promise<{ count: number }> {
  const response = await apiClient.get<{ count: number }>(
    API_ENDPOINTS.USER_NOTIFICATIONS_UNREAD_COUNT
  );
  return response.data;
}

export async function markNotificationAsRead(id: number): Promise<NotificationResponse> {
  const response = await apiClient.put<NotificationResponse>(
    API_ENDPOINTS.USER_NOTIFICATION_READ(id)
  );
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.put(API_ENDPOINTS.USER_NOTIFICATIONS_READ_ALL);
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.USER_NOTIFICATION_DELETE(id));
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await apiClient.get<NotificationPreferences>(
    API_ENDPOINTS.USER_NOTIFICATION_PREFERENCES
  );
  return response.data;
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const response = await apiClient.put<NotificationPreferences>(
    API_ENDPOINTS.USER_NOTIFICATION_PREFERENCES,
    preferences
  );
  return response.data;
}
