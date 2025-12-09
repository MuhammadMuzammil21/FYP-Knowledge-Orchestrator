import { getSpeakers, updateSpeaker, addSpeaker } from '../api/speakers';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Speakers API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getSpeakers', () => {
        it('should fetch all speakers for a meeting', async () => {
            const mockResponse = {
                data: {
                    speakers: [
                        {
                            id: 16,
                            original_label: 'SPEAKER_00',
                            display_name: 'John',
                            known_speaker_id: 5,
                            has_embedding: true,
                        },
                    ],
                },
            };

            mockedApiClient.get.mockResolvedValue(mockResponse);
            const result = await getSpeakers('meeting-1');

            expect(mockedApiClient.get).toHaveBeenCalledWith('/api/meetings/meeting-1/speakers');
            expect(result).toEqual(mockResponse.data);
        });

        it('should return speakers with embeddings', async () => {
            const mockResponse = {
                data: {
                    speakers: [
                        {
                            id: 16,
                            original_label: 'SPEAKER_00',
                            display_name: 'John',
                            known_speaker_id: null,
                            has_embedding: true,
                        },
                    ],
                },
            };

            mockedApiClient.get.mockResolvedValue(mockResponse);
            const result = await getSpeakers('meeting-1');

            expect(result.speakers[0].has_embedding).toBe(true);
        });

        it('should return speakers linked to known speakers', async () => {
            const mockResponse = {
                data: {
                    speakers: [
                        {
                            id: 16,
                            original_label: 'SPEAKER_00',
                            display_name: 'John',
                            known_speaker_id: 5,
                            has_embedding: true,
                        },
                    ],
                },
            };

            mockedApiClient.get.mockResolvedValue(mockResponse);
            const result = await getSpeakers('meeting-1');

            expect(result.speakers[0].known_speaker_id).toBe(5);
        });

        it('should handle meeting with no speakers', async () => {
            const mockResponse = {
                data: {
                    speakers: [],
                },
            };

            mockedApiClient.get.mockResolvedValue(mockResponse);
            const result = await getSpeakers('meeting-1');

            expect(result.speakers).toHaveLength(0);
        });
    });

    describe('updateSpeaker', () => {
        it('should update speaker display name via query param', async () => {
            const mockResponse = {
                data: {
                    id: 16,
                    original_label: 'SPEAKER_00',
                    display_name: 'John Smith',
                    known_speaker_id: null,
                    has_embedding: true,
                },
            };

            mockedApiClient.put.mockResolvedValue(mockResponse);
            const result = await updateSpeaker('meeting-1', 16, 'John Smith');

            expect(mockedApiClient.put).toHaveBeenCalledWith(
                '/api/meetings/meeting-1/speakers/16',
                null,
                { params: { display_name: 'John Smith' } }
            );
            expect(result.display_name).toBe('John Smith');
        });

        it('should handle speaker not found error', async () => {
            mockedApiClient.put.mockRejectedValue(new Error('Speaker not found'));

            await expect(updateSpeaker('meeting-1', 999, 'Test')).rejects.toThrow(
                'Speaker not found'
            );
        });

        it('should validate display name is not empty', async () => {
            mockedApiClient.put.mockRejectedValue(new Error('Display name cannot be empty'));

            await expect(updateSpeaker('meeting-1', 16, '')).rejects.toThrow(
                'Display name cannot be empty'
            );
        });
    });

    describe('addSpeaker', () => {
        it('should add new speaker mapping', async () => {
            const mockResponse = {
                data: {
                    id: 17,
                    original_label: 'SPEAKER_05',
                    display_name: 'Guest Speaker',
                    known_speaker_id: null,
                    has_embedding: false,
                },
            };

            mockedApiClient.post.mockResolvedValue(mockResponse);
            const result = await addSpeaker('meeting-1', {
                original_label: 'SPEAKER_05',
                display_name: 'Guest Speaker',
            });

            expect(mockedApiClient.post).toHaveBeenCalledWith('/api/meetings/meeting-1/speakers', {
                original_label: 'SPEAKER_05',
                display_name: 'Guest Speaker',
            });
            expect(result.original_label).toBe('SPEAKER_05');
        });

        it('should validate original label format', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('Invalid label format'));

            await expect(
                addSpeaker('meeting-1', {
                    original_label: 'INVALID',
                    display_name: 'Test',
                })
            ).rejects.toThrow('Invalid label format');
        });

        it('should handle duplicate speaker label error', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('Speaker label already exists'));

            await expect(
                addSpeaker('meeting-1', {
                    original_label: 'SPEAKER_00',
                    display_name: 'Test',
                })
            ).rejects.toThrow('Speaker label already exists');
        });
    });
});
