import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type {
  KnownSpeaker,
  KnownSpeakersResponse,
  CreateKnownSpeakerRequest,
  UpdateKnownSpeakerRequest,
} from '@/types';

/**
 * List all known speakers for the current user
 */
export async function getKnownSpeakers(): Promise<KnownSpeakersResponse> {
  const response = await apiClient.get<KnownSpeakersResponse>(API_ENDPOINTS.KNOWN_SPEAKERS_LIST);
  return response.data;
}

/**
 * Create a known speaker from an existing speaker mapping
 */
export async function createKnownSpeaker(data: CreateKnownSpeakerRequest): Promise<KnownSpeaker> {
  const response = await apiClient.post<KnownSpeaker>(API_ENDPOINTS.KNOWN_SPEAKERS_CREATE, data);
  return response.data;
}

/**
 * Update a known speaker's name
 */
export async function updateKnownSpeaker(
  id: number,
  data: UpdateKnownSpeakerRequest
): Promise<KnownSpeaker> {
  const response = await apiClient.put<KnownSpeaker>(API_ENDPOINTS.KNOWN_SPEAKER_UPDATE(id), data);
  return response.data;
}

/**
 * Delete a known speaker
 */
export async function deleteKnownSpeaker(id: number): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    API_ENDPOINTS.KNOWN_SPEAKER_DELETE(id)
  );
  return response.data;
}

/**
 * Get unlinked known speaker prompts
 */
export async function getUnlinkedPrompts(): Promise<any> {
  try {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.KNOWN_SPEAKERS_UNLINKED_PROMPTS
    );
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { unlinked_speakers: [] };
    }
    throw err;
  }
}

/**
 * Mark a known speaker as external
 */
export async function markKnownSpeakerExternal(id: number): Promise<any> {
  const response = await apiClient.post<any>(
    API_ENDPOINTS.KNOWN_SPEAKER_MARK_EXTERNAL(id)
  );
  return response.data;
}

/**
 * Link a known speaker to a user account
 */
export async function linkKnownSpeakerAccount(
  id: number,
  data: { email?: string; user_id?: string; dry_run?: boolean }
): Promise<any> {
  const response = await apiClient.post<any>(
    API_ENDPOINTS.KNOWN_SPEAKER_LINK_ACCOUNT(id),
    data
  );
  return response.data;
}

/**
 * Fetch details for a specific known speaker by ID
 */
export async function getKnownSpeaker(id: number): Promise<KnownSpeaker> {
  const response = await apiClient.get<KnownSpeaker>(
    API_ENDPOINTS.KNOWN_SPEAKER_DETAIL(id)
  );
  return response.data;
}

/**
 * List known speakers associated with a specific team
 */
export async function getKnownSpeakersByTeam(teamId: string): Promise<KnownSpeakersResponse> {
  const response = await apiClient.get<KnownSpeakersResponse>(
    API_ENDPOINTS.KNOWN_SPEAKERS_BY_TEAM(teamId)
  );
  return response.data;
}

/**
 * Merge two known speaker profiles into one
 */
export async function mergeKnownSpeakers(data: {
  source_id: number;
  target_id: number;
}): Promise<KnownSpeaker> {
  const response = await apiClient.post<KnownSpeaker>(
    API_ENDPOINTS.KNOWN_SPEAKERS_MERGE,
    data
  );
  return response.data;
}

/**
 * Reset all known speakers for the current user/team
 */
export async function resetAllKnownSpeakers(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    API_ENDPOINTS.KNOWN_SPEAKERS_RESET_ALL
  );
  return response.data;
}
