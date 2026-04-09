/**
 * People Service
 * Handles all people-related API operations
 */

import { BaseService } from './base/BaseService';
import { ENDPOINT_CONFIG } from '@/lib/config/endpoints.config';
import type { PersonTasks } from '@/types/domain.types';

/**
 * People Service Class
 */
export class PeopleService extends BaseService {
  constructor() {
    super({
      resourceName: 'people',
      baseEndpoint: ENDPOINT_CONFIG.people.base,
    });
  }

  /**
   * Get tasks for a person
   */
  async getPersonTasks(personName: string, projectId?: string): Promise<PersonTasks> {
    const { adaptPersonTasks } = await import('@/lib/api/adapters/ResponseAdapter');

    const response = await this.request({
      method: 'GET',
      url: `${this.baseEndpoint}${ENDPOINT_CONFIG.people.endpoints.tasks(personName)}`,
      params: projectId ? ({ project_id: projectId } as any) : undefined,
    });

    return adaptPersonTasks(response);
  }
}

/**
 * Export singleton instance
 */
export const peopleService = new PeopleService();
