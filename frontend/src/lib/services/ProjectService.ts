/**
 * Project Service
 * Handles all project-related API operations
 */

import { BaseService } from './base/BaseService';
import { ENDPOINT_CONFIG } from '@/lib/config/endpoints.config';
import type { KnowledgeGraph, Conflict } from '@/types/domain.types';

/**
 * Project Service Class
 */
export class ProjectService extends BaseService {
  constructor() {
    super({
      resourceName: 'project',
      baseEndpoint: ENDPOINT_CONFIG.projects.base,
    });
  }

  /**
   * Get project knowledge graph
   */
  async getProjectGraph(projectId: string): Promise<KnowledgeGraph> {
    const { adaptKnowledgeGraph } = await import('@/lib/api/adapters/ResponseAdapter');

    const response = await this.request({
      method: 'GET',
      url: ENDPOINT_CONFIG.projects.endpoints.graph(projectId),
    });

    return adaptKnowledgeGraph(response);
  }

  /**
   * Get project conflicts
   */
  async getProjectConflicts(projectId: string, meetingId?: string): Promise<Conflict[]> {
    const { adaptConflicts } = await import('@/lib/api/adapters/ResponseAdapter');

    const response = await this.request({
      method: 'GET',
      url: ENDPOINT_CONFIG.projects.endpoints.conflicts(projectId),
      params: meetingId ? { meeting_id: meetingId } : undefined,
    });

    return adaptConflicts(response);
  }
}

/**
 * Export singleton instance
 */
export const projectService = new ProjectService();
