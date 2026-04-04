import { uploadMeeting, getMeetings, getMeeting, getMeetingStatus } from '../api/meetings';
import apiClient from '../api/client';

// Mock the API client
jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Meetings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadMeeting', () => {
    it('should upload meeting with file and project ID', async () => {
      const mockFile = new File(['audio content'], 'meeting.mp3', { type: 'audio/mpeg' });
      const mockResponse = {
        data: {
          meeting_id: 'meeting-123',
          project_id: 'project-456',
          status: 'queued',
          stage: 'asr_pending',
          message: 'Meeting uploaded successfully',
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await uploadMeeting(mockFile, 'project-456');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/meetings/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getMeetings', () => {
    it('should fetch meetings list with pagination', async () => {
      const mockResponse = {
        data: {
          meetings: [
            {
              meeting_id: '1',
              title: 'Meeting 1',
              status: 'completed',
              created_at: '2025-01-01',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getMeetings({ limit: 10, offset: 0 });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/meetings', {
        params: { limit: 10, offset: 0 },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getMeeting', () => {
    it('should fetch meeting detail by ID', async () => {
      const mockResponse = {
        data: {
          meeting_id: 'meeting-123',
          project_id: 'project-456',
          status: 'completed',
          stage: 'completed',
          duration_seconds: 1800,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          insights_ready: true,
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getMeeting('meeting-123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/meetings/meeting-123');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getMeetingStatus', () => {
    it('should fetch meeting status with progress', async () => {
      const mockResponse = {
        data: {
          meeting_id: 'meeting-123',
          status: 'processing',
          stage: 'llm_cleanup',
          progress: 45,
          asr: { done: true, transcript_raw_available: true },
          llm_cleanup: { done: false, streaming_available: true },
          background: { conflicts: 'pending', knowledge_graph: 'pending', rag: 'pending' },
          final_transcript_ready: false,
          insights_ready: false,
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getMeetingStatus('meeting-123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/meetings/meeting-123/status');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
