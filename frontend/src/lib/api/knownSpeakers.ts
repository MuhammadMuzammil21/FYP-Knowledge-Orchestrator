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
    const response = await apiClient.get<KnownSpeakersResponse>(
        API_ENDPOINTS.KNOWN_SPEAKERS_LIST
    );
    return response.data;
}

/**
 * Create a known speaker from an existing speaker mapping
 */
export async function createKnownSpeaker(
    data: CreateKnownSpeakerRequest
): Promise<KnownSpeaker> {
    const response = await apiClient.post<KnownSpeaker>(
        API_ENDPOINTS.KNOWN_SPEAKERS_CREATE,
        data
    );
    return response.data;
}

/**
 * Update a known speaker's name
 */
export async function updateKnownSpeaker(
    id: number,
    data: UpdateKnownSpeakerRequest
): Promise<KnownSpeaker> {
    const response = await apiClient.put<KnownSpeaker>(
        API_ENDPOINTS.KNOWN_SPEAKER_UPDATE(id),
        data
    );
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
