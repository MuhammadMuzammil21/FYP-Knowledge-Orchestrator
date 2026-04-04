import {
  getKnownSpeakers,
  createKnownSpeaker,
  updateKnownSpeaker,
  deleteKnownSpeaker,
} from '../api/knownSpeakers';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Known Speakers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getKnownSpeakers', () => {
    it('should fetch all known speakers', async () => {
      const mockResponse = {
        data: {
          known_speakers: [
            {
              id: 5,
              name: 'Laura Smith',
              meeting_count: 12,
              created_at: '2025-12-01T10:00:00Z',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getKnownSpeakers();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/known-speakers');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return speakers with meeting counts', async () => {
      const mockResponse = {
        data: {
          known_speakers: [
            {
              id: 5,
              name: 'Laura Smith',
              meeting_count: 12,
              created_at: '2025-12-01T10:00:00Z',
            },
          ],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getKnownSpeakers();

      expect(result.known_speakers[0].meeting_count).toBe(12);
    });

    it('should return empty array when no known speakers', async () => {
      const mockResponse = {
        data: {
          known_speakers: [],
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);
      const result = await getKnownSpeakers();

      expect(result.known_speakers).toHaveLength(0);
    });
  });

  describe('createKnownSpeaker', () => {
    it('should create known speaker from speaker mapping', async () => {
      const mockResponse = {
        data: {
          id: 6,
          name: 'John Doe',
          meeting_count: 1,
          created_at: '2025-12-09T15:00:00Z',
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);
      const result = await createKnownSpeaker({
        name: 'John Doe',
        source_speaker_mapping_id: 17,
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/known-speakers', {
        name: 'John Doe',
        source_speaker_mapping_id: 17,
      });
      expect(result.name).toBe('John Doe');
    });

    it('should validate source_speaker_mapping_id exists', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Speaker mapping not found'));

      await expect(
        createKnownSpeaker({
          name: 'Test',
          source_speaker_mapping_id: 999,
        })
      ).rejects.toThrow('Speaker mapping not found');
    });

    it('should validate name is not empty', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Name cannot be empty'));

      await expect(
        createKnownSpeaker({
          name: '',
          source_speaker_mapping_id: 17,
        })
      ).rejects.toThrow('Name cannot be empty');
    });

    it('should handle duplicate name error', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Known speaker name already exists'));

      await expect(
        createKnownSpeaker({
          name: 'Laura Smith',
          source_speaker_mapping_id: 17,
        })
      ).rejects.toThrow('Known speaker name already exists');
    });
  });

  describe('updateKnownSpeaker', () => {
    it('should update known speaker name', async () => {
      const mockResponse = {
        data: {
          id: 5,
          name: 'John D. Smith',
          meeting_count: 12,
          created_at: '2025-12-01T10:00:00Z',
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);
      const result = await updateKnownSpeaker(5, { name: 'John D. Smith' });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/known-speakers/5', {
        name: 'John D. Smith',
      });
      expect(result.name).toBe('John D. Smith');
    });

    it('should handle speaker not found error', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Known speaker not found'));

      await expect(updateKnownSpeaker(999, { name: 'Test' })).rejects.toThrow(
        'Known speaker not found'
      );
    });

    it('should validate new name is not empty', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Name cannot be empty'));

      await expect(updateKnownSpeaker(5, { name: '' })).rejects.toThrow('Name cannot be empty');
    });
  });

  describe('deleteKnownSpeaker', () => {
    it('should delete known speaker', async () => {
      const mockResponse = {
        data: {
          message: 'Known speaker deleted successfully',
        },
      };

      mockedApiClient.delete.mockResolvedValue(mockResponse);
      const result = await deleteKnownSpeaker(5);

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/known-speakers/5');
      expect(result.message).toBe('Known speaker deleted successfully');
    });

    it('should handle speaker not found error', async () => {
      mockedApiClient.delete.mockRejectedValue(new Error('Known speaker not found'));

      await expect(deleteKnownSpeaker(999)).rejects.toThrow('Known speaker not found');
    });

    it('should return success message', async () => {
      const mockResponse = {
        data: {
          message: 'Known speaker deleted successfully',
        },
      };

      mockedApiClient.delete.mockResolvedValue(mockResponse);
      const result = await deleteKnownSpeaker(5);

      expect(result).toHaveProperty('message');
    });
  });
});
