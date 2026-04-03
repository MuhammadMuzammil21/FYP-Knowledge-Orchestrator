import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import type {
    Speaker,
    SpeakersResponse,
    AddSpeakerRequest,
} from '@/types';

/**
 * Get all speakers for a meeting
 */
export async function getSpeakers(meetingId: string): Promise<SpeakersResponse> {
    const response = await apiClient.get<SpeakersResponse>(
        API_ENDPOINTS.MEETING_SPEAKERS(meetingId)
    );
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
export async function addSpeaker(
    meetingId: string,
    data: AddSpeakerRequest
): Promise<Speaker> {
    const response = await apiClient.post<Speaker>(
        API_ENDPOINTS.MEETING_SPEAKERS(meetingId),
        data
    );
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
