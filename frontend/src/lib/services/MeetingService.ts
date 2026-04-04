/**
 * Meeting Service
 * Handles all meeting-related API operations
 *
 * Extends BaseService with meeting-specific methods
 */

import { BaseService } from './base/BaseService';
import { ENDPOINT_CONFIG } from '@/lib/config/endpoints.config';
import { APP_CONFIG } from '@/lib/config/app.config';
import {
  adaptMeeting,
  adaptMeetingList,
  adaptMeetingDetail,
  adaptMeetingStatus,
  adaptTranscript,
  adaptEntities,
  adaptSearchResults,
  adaptRAGResponse,
  adaptConflicts,
  adaptMeetingUploadResponse,
} from '@/lib/api/adapters/ResponseAdapter';
import { adaptMeetingUploadRequest } from '@/lib/api/adapters/RequestAdapter';
import type {
  Meeting,
  MeetingDetail,
  MeetingStatusDetail,
  Transcript,
  Entities,
  SearchResult,
  RAGResponse,
  Conflict,
} from '@/types/domain.types';
import type { PaginationParams } from '@/types/generics.types';

/**
 * Meeting Service Class
 */
export class MeetingService extends BaseService<Meeting> {
  constructor() {
    super({
      resourceName: 'meeting',
      baseEndpoint: ENDPOINT_CONFIG.meetings.base,
      cacheTime: APP_CONFIG.cache.staleTime.meetings,
    });
  }

  /**
   * Get all meetings with pagination
   */
  async getMeetings(params?: PaginationParams & { project_id?: string }): Promise<Meeting[]> {
    const response = await this.request({
      method: 'GET',
      url: this.baseEndpoint,
      params: params as any,
    });

    return adaptMeetingList(response);
  }

  /**
   * Get meeting detail by ID
   */
  async getMeetingDetail(meetingId: string): Promise<MeetingDetail> {
    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.detail(meetingId)}`,
    });

    return adaptMeetingDetail(response);
  }

  /**
   * Get meeting status
   */
  async getMeetingStatus(meetingId: string): Promise<MeetingStatusDetail> {
    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.status(meetingId)}`,
    });

    return adaptMeetingStatus(response);
  }

  /**
   * Get meeting transcript
   */
  async getTranscript(meetingId: string, type: 'raw' | 'final' = 'final'): Promise<Transcript> {
    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.transcript(meetingId)}`,
      params: { type },
    });

    return adaptTranscript(response);
  }

  /**
   * Get meeting entities
   */
  async getEntities(meetingId: string): Promise<Entities> {
    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.entities(meetingId)}`,
    });

    return adaptEntities((response as any).entities || response);
  }

  /**
   * Search meeting transcript
   */
  async searchMeeting(meetingId: string, query: string): Promise<SearchResult[]> {
    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.search(meetingId)}`,
      params: { q: query },
    });

    return adaptSearchResults(response);
  }

  /**
   * RAG query on meeting
   */
  async ragQuery(meetingId: string, query: string): Promise<RAGResponse> {
    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.ragQuery(meetingId)}`,
      params: { q: query },
    });

    return adaptRAGResponse(response);
  }

  /**
   * Upload meeting file
   */
  async uploadMeeting(
    file: File,
    projectId: string,
    metadata?: Record<string, any>
  ): Promise<{
    meetingId: string;
    projectId: string;
    status: string;
    stage: string;
    message: string;
  }> {
    const formData = adaptMeetingUploadRequest(file, projectId, metadata);

    const response = await this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.upload}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return adaptMeetingUploadResponse(response);
  }

  /**
   * Create transcript stream (SSE)
   * Note: This returns an EventSource, not a Promise
   */
  createTranscriptStream(
    meetingId: string,
    token: string,
    onPartial: (text: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): EventSource {
    const url = `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.transcriptStream(meetingId)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('partial', (event) => {
      try {
        const data = JSON.parse(event.data);
        onPartial(data.text);
      } catch (error) {
        onError(error as Error);
      }
    });

    eventSource.addEventListener('done', () => {
      onDone();
      eventSource.close();
    });

    eventSource.onerror = () => {
      onError(new Error('Stream connection error'));
      eventSource.close();
    };

    return eventSource;
  }

  /**
   * Get meeting speakers
   */
  async getSpeakers(meetingId: string): Promise<import('@/types/domain.types').Speaker[]> {
    const { adaptSpeakers } = await import('@/lib/api/adapters/ResponseAdapter');

    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.speakers(meetingId)}`,
    });

    return adaptSpeakers(response);
  }

  /**
   * Update speaker display name
   */
  async updateSpeaker(meetingId: string, speakerId: number, displayName: string): Promise<void> {
    await this.request({
      method: 'PUT',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.speakerDetail(meetingId, speakerId)}`,
      params: { display_name: displayName } as any,
    });
  }

  /**
   * Add speaker mapping
   */
  async addSpeaker(meetingId: string, originalLabel: string, displayName: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.speakers(meetingId)}`,
      params: { original_label: originalLabel, display_name: displayName } as any,
    });
  }

  /**
   * Get meeting knowledge graph
   */
  async getMeetingGraph(meetingId: string): Promise<import('@/types/domain.types').KnowledgeGraph> {
    const { adaptKnowledgeGraph } = await import('@/lib/api/adapters/ResponseAdapter');

    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.meetings.endpoints.graph(meetingId)}`,
    });

    return adaptKnowledgeGraph(response);
  }
}

/**
 * Export singleton instance
 */
export const meetingService = new MeetingService();
