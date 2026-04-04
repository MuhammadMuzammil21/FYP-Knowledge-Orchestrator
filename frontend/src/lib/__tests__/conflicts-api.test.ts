import { getProjectConflicts, resolveConflict } from '../api/conflicts';
import apiClient from '../api/client';

// Mock the API client
jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Conflicts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectConflicts', () => {
    it('should fetch all conflicts for a project', async () => {
      const mockResponse = {
        data: {
          project_id: 'project-1',
          total_conflicts: 2,
          conflicts: [
            {
              id: 1,
              source_meeting_id: 'newer-meeting',
              target_meeting_id: 'older-meeting',
              conflict_type: 'task_reassignment',
              description: 'Task reassigned from Laura to David',
              severity: 'medium',
              resolved: false,
              created_at: '2025-12-09T10:00:00Z',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjectConflicts('project-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/projects/project-1/conflicts');
      expect(result).toEqual(mockResponse.data);
      expect(result.total_conflicts).toBe(2);
    });

    it('should return empty conflicts array when none exist', async () => {
      const mockResponse = {
        data: {
          project_id: 'project-1',
          total_conflicts: 0,
          conflicts: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjectConflicts('project-1');

      expect(result.conflicts).toHaveLength(0);
    });

    it('should include conflict metadata (total count, severity)', async () => {
      const mockResponse = {
        data: {
          project_id: 'project-1',
          total_conflicts: 1,
          conflicts: [
            {
              id: 1,
              source_meeting_id: 'meeting-1',
              target_meeting_id: 'meeting-2',
              conflict_type: 'deadline_change',
              description: 'Deadline changed',
              severity: 'high',
              resolved: false,
              created_at: '2025-12-09T10:00:00Z',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjectConflicts('project-1');

      expect(result.conflicts[0].severity).toBe('high');
      expect(result.total_conflicts).toBe(1);
    });

    it('should filter by conflict type if supported', async () => {
      const mockResponse = {
        data: {
          project_id: 'project-1',
          total_conflicts: 1,
          conflicts: [
            {
              id: 1,
              source_meeting_id: 'meeting-1',
              target_meeting_id: 'meeting-2',
              conflict_type: 'task_reassignment',
              description: 'Task reassigned',
              severity: 'low',
              resolved: false,
              created_at: '2025-12-09T10:00:00Z',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjectConflicts('project-1');

      expect(result.conflicts[0].conflict_type).toBe('task_reassignment');
    });
  });

  describe('resolveConflict', () => {
    it('should mark conflict as resolved with note', async () => {
      const mockResponse = {
        data: {
          id: 1,
          source_meeting_id: 'meeting-1',
          target_meeting_id: 'meeting-2',
          conflict_type: 'task_reassignment',
          description: 'Task reassigned',
          severity: 'medium',
          resolved: true,
          created_at: '2025-12-09T10:00:00Z',
          resolution_note: 'Discussed in follow-up meeting',
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await resolveConflict('project-1', 1, {
        resolved: true,
        resolution_note: 'Discussed in follow-up meeting',
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/projects/project-1/conflicts/1/resolve',
        { resolved: true, resolution_note: 'Discussed in follow-up meeting' }
      );
      expect(result.resolved).toBe(true);
      expect(result.resolution_note).toBe('Discussed in follow-up meeting');
    });

    it('should mark conflict as resolved without note', async () => {
      const mockResponse = {
        data: {
          id: 1,
          source_meeting_id: 'meeting-1',
          target_meeting_id: 'meeting-2',
          conflict_type: 'deadline_change',
          description: 'Deadline changed',
          severity: 'low',
          resolved: true,
          created_at: '2025-12-09T10:00:00Z',
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await resolveConflict('project-1', 1, { resolved: true });

      expect(result.resolved).toBe(true);
      expect(result.resolution_note).toBeUndefined();
    });

    it('should handle conflict not found error', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Conflict not found'));

      await expect(resolveConflict('project-1', 999, { resolved: true })).rejects.toThrow(
        'Conflict not found'
      );
    });

    it('should validate resolution note length', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Resolution note too long'));

      await expect(
        resolveConflict('project-1', 1, {
          resolved: true,
          resolution_note: 'a'.repeat(1000),
        })
      ).rejects.toThrow('Resolution note too long');
    });
  });
});
