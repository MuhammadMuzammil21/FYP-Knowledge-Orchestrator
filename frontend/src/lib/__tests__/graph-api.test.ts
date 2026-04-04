import { getMeetingGraph, getPersonTasks } from '../api/graph';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Knowledge Graph API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMeetingGraph', () => {
    it('should fetch meeting graph with participants', async () => {
      const mockResponse = {
        data: {
          participants: [{ name: 'Laura', created_at: '2025-12-09T08:27:45Z' }],
          tasks: [],
          decisions: [],
          topics: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getMeetingGraph('meeting-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/meetings/meeting-1/graph');
      expect(result.participants).toHaveLength(1);
    });

    it('should include tasks with assignees', async () => {
      const mockResponse = {
        data: {
          participants: [],
          tasks: [
            {
              id: 'task-1',
              description: 'Design mockups',
              assignee: 'Laura',
              due_date: '2025-12-15',
              created_at: '2025-12-09T08:27:45Z',
            },
          ],
          decisions: [],
          topics: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getMeetingGraph('meeting-1');

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].assignee).toBe('Laura');
    });

    it('should include decisions', async () => {
      const mockResponse = {
        data: {
          participants: [],
          tasks: [],
          decisions: [
            {
              id: 'decision-1',
              description: 'Use agile methodology',
              created_at: '2025-12-09T08:27:45Z',
            },
          ],
          topics: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getMeetingGraph('meeting-1');

      expect(result.decisions).toHaveLength(1);
    });

    it('should include topics', async () => {
      const mockResponse = {
        data: {
          participants: [],
          tasks: [],
          decisions: [],
          topics: ['Product Strategy', 'Timeline'],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getMeetingGraph('meeting-1');

      expect(result.topics).toHaveLength(2);
    });

    it('should handle meeting with no graph data', async () => {
      const mockResponse = {
        data: {
          participants: [],
          tasks: [],
          decisions: [],
          topics: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getMeetingGraph('meeting-1');

      expect(result.participants).toHaveLength(0);
      expect(result.tasks).toHaveLength(0);
    });
  });

  describe('getPersonTasks', () => {
    it('should fetch all tasks for a person', async () => {
      const mockResponse = {
        data: {
          person_name: 'Laura',
          tasks: [
            {
              id: 'task-1',
              description: 'Design mockups',
              due_date: '2025-12-15',
              status: 'pending',
              meeting_id: 'meeting-1',
              meeting_title: 'Team Standup',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getPersonTasks('Laura');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/people/Laura/tasks', {
        params: undefined,
      });
      expect(result.tasks).toHaveLength(1);
    });

    it('should filter tasks by project_id when provided', async () => {
      const mockResponse = {
        data: {
          person_name: 'Laura',
          tasks: [
            {
              id: 'task-1',
              description: 'Design mockups',
              due_date: '2025-12-15',
              status: 'pending',
              meeting_id: 'meeting-1',
              meeting_title: 'Team Standup',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getPersonTasks('Laura', 'project-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/people/Laura/tasks', {
        params: { project_id: 'project-1' },
      });
      expect(result.tasks).toHaveLength(1);
    });

    it('should return tasks with meeting context', async () => {
      const mockResponse = {
        data: {
          person_name: 'Laura',
          tasks: [
            {
              id: 'task-1',
              description: 'Design mockups',
              due_date: '2025-12-15',
              status: 'pending',
              meeting_id: 'meeting-1',
              meeting_title: 'Team Standup',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getPersonTasks('Laura');

      expect(result.tasks[0].meeting_id).toBe('meeting-1');
      expect(result.tasks[0].meeting_title).toBe('Team Standup');
    });

    it('should handle person with no tasks', async () => {
      const mockResponse = {
        data: {
          person_name: 'Laura',
          tasks: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getPersonTasks('Laura');

      expect(result.tasks).toHaveLength(0);
    });

    it('should properly encode person name in URL', async () => {
      const mockResponse = {
        data: {
          person_name: 'John Doe',
          tasks: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      await getPersonTasks('John Doe');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/people/John Doe/tasks', {
        params: undefined,
      });
    });
  });
});
