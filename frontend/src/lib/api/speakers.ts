import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type { Speaker, SpeakersResponse, AddSpeakerRequest } from '@/types';

/**
 * Get all speakers for a meeting
 */
export async function getSpeakers(meetingId: string): Promise<SpeakersResponse> {
  const response = await apiClient.get<SpeakersResponse>(API_ENDPOINTS.MEETING_SPEAKERS(meetingId));
  return response.data;
}

/**
 * Update a speaker's display name
 */
export async function updateSpeaker(
  meetingId: string,
  speakerId: number,
  displayName: string
): Promise<Speaker> {
  const response = await apiClient.put<Speaker>(
    API_ENDPOINTS.MEETING_SPEAKER_UPDATE(meetingId, speakerId),
    null,
    {
      params: { display_name: displayName },
    }
  );
  return response.data;
}

/**
 * Add a new speaker mapping manually
 */
export async function addSpeaker(meetingId: string, data: AddSpeakerRequest): Promise<Speaker> {
  const response = await apiClient.post<Speaker>(API_ENDPOINTS.MEETING_SPEAKERS(meetingId), data);
  return response.data;
}

/**
 * Link a speaker to a user
 */
export async function linkSpeakerToUser(
  meetingId: string,
  speakerId: number,
  userId: string
): Promise<Speaker> {
  const response = await apiClient.post<Speaker>(
    API_ENDPOINTS.MEETING_SPEAKER_LINK_USER(meetingId, speakerId),
    { user_id: userId }
  );
  return response.data;
}

/**
 * Unlink a speaker from a user
 */
export async function unlinkSpeakerFromUser(
  meetingId: string,
  speakerId: number
): Promise<Speaker> {
  const response = await apiClient.delete<Speaker>(
    API_ENDPOINTS.MEETING_SPEAKER_LINK_USER(meetingId, speakerId)
  );
  return response.data;
}

/**
 * Force link a speaker by email
 */
export async function forceLinkEmailSpeaker(
  meetingId: string,
  speakerId: number,
  data: { email: string }
): Promise<any> {
  try {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.MEETING_SPEAKER_FORCE_LINK(meetingId, speakerId),
      data
    );
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      // Mock fallback if not deployed
      return { linked_user_id: undefined, affected_meetings: 0, dry_run: false };
    }
    throw err;
  }
}

/**
 * Rematch a speaker
 */
export async function rematchSpeaker(
  meetingId: string,
  speakerId: number
): Promise<Speaker> {
  const response = await apiClient.post<Speaker>(
    API_ENDPOINTS.MEETING_SPEAKER_REMATCH(meetingId, speakerId)
  );
  return response.data;
}

/**
 * Get review queue for a meeting
 */
export async function getReviewQueue(
  meetingId: string
): Promise<{ proposals: any[] }> {
  try {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.MEETING_SPEAKER_REVIEW_QUEUE(meetingId)
    );
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      // Mock fallback if not deployed
      return { proposals: [] };
    }
    throw err;
  }
}

/**
 * Process a proposed review action
 */
export async function processReviewProposal(
  meetingId: string,
  speakerId: number,
  proposalId: number,
  action: 'confirm' | 'correct' | 'dismiss'
): Promise<any> {
  const response = await apiClient.post<any>(
    API_ENDPOINTS.MEETING_SPEAKER_PROPOSAL_ACTION(meetingId, speakerId, proposalId, action)
  );
  return response.data;
}
