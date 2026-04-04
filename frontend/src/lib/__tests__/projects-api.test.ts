import { getProjects, getProject, updateProject, getProjectGraph } from '../api/projects';
import apiClient from '../api/client';

// Mock the API client
jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Projects API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should fetch all projects for the user', async () => {
      const mockResponse = {
        data: {
          projects: [
            {
              id: 'project-1',
              name: 'Product Redesign',
              description: 'Q4 2025 initiative',
              created_at: '2025-10-01T00:00:00Z',
              meeting_count: 12,
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjects();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/projects');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return empty array when no projects exist', async () => {
      const mockResponse = {
        data: {
          projects: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjects();

      expect(result.projects).toHaveLength(0);
    });
  });

  describe('getProject', () => {
    it('should fetch project details with meetings list', async () => {
      const mockResponse = {
        data: {
          id: 'project-1',
          name: 'Product Redesign',
          description: 'Q4 2025 initiative',
          created_at: '2025-10-01T00:00:00Z',
          updated_at: '2025-12-09T00:00:00Z',
          meeting_count: 2,
          meetings: [
            {
              meeting_id: 'meeting-1',
              title: 'Kickoff Meeting',
              status: 'completed',
              created_at: '2025-10-05T10:00:00Z',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProject('project-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/projects/project-1');
      expect(result).toEqual(mockResponse.data);
      expect(result.meetings).toHaveLength(1);
    });

    it('should handle project not found error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Project not found'));

      await expect(getProject('invalid-id')).rejects.toThrow('Project not found');
    });
  });

  describe('updateProject', () => {
    it('should update project name', async () => {
      const mockResponse = {
        data: {
          id: 'project-1',
          name: 'Updated Project Name',
          description: 'Q4 2025 initiative',
          created_at: '2025-10-01T00:00:00Z',
          meeting_count: 12,
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await updateProject('project-1', { name: 'Updated Project Name' });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/projects/project-1', {
        name: 'Updated Project Name',
      });
      expect(result.name).toBe('Updated Project Name');
    });

    it('should update project description', async () => {
      const mockResponse = {
        data: {
          id: 'project-1',
          name: 'Product Redesign',
          description: 'Updated description',
          created_at: '2025-10-01T00:00:00Z',
          meeting_count: 12,
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await updateProject('project-1', { description: 'Updated description' });

      expect(result.description).toBe('Updated description');
    });

    it('should update both name and description', async () => {
      const mockResponse = {
        data: {
          id: 'project-1',
          name: 'New Name',
          description: 'New Description',
          created_at: '2025-10-01T00:00:00Z',
          meeting_count: 12,
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await updateProject('project-1', {
        name: 'New Name',
        description: 'New Description',
      });

      expect(result.name).toBe('New Name');
      expect(result.description).toBe('New Description');
    });

    it('should handle validation errors', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Validation failed'));

      await expect(updateProject('project-1', { name: '' })).rejects.toThrow('Validation failed');
    });
  });

  describe('getProjectGraph', () => {
    it('should fetch project knowledge graph', async () => {
      const mockResponse = {
        data: {
          nodes: [
            {
              id: 123,
              labels: ['Meeting'],
              properties: { id: 'meeting-uuid', title: 'Team Standup' },
            },
          ],
          edges: [
            {
              type: 'PARTICIPATES_IN',
              start: 124,
              end: 123,
              properties: {},
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjectGraph('project-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/projects/project-1/graph');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return graph with nodes and edges', async () => {
      const mockResponse = {
        data: {
          nodes: [{ id: 1, labels: ['Person'], properties: { name: 'Laura' } }],
          edges: [{ type: 'ASSIGNED_TO', start: 2, end: 1, properties: {} }],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getProjectGraph('project-1');

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
    });
  });
});
