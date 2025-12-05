import axios from 'axios';
import { getErrorMessage } from '../api/client';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client', () => {
    describe('getErrorMessage', () => {
        it('should extract string error message from axios error', () => {
            const error = {
                isAxiosError: true,
                response: {
                    data: {
                        detail: 'Test error message',
                    },
                },
                message: 'Network error',
            };

            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;
            const message = getErrorMessage(error);
            expect(message).toBe('Test error message');
        });

        it('should extract validation errors from axios error', () => {
            const error = {
                isAxiosError: true,
                response: {
                    data: {
                        detail: [
                            { msg: 'Field is required' },
                            { msg: 'Invalid format' },
                        ],
                    },
                },
                message: 'Validation error',
            };

            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;
            const message = getErrorMessage(error);
            expect(message).toBe('Field is required, Invalid format');
        });

        it('should return axios error message if no detail', () => {
            const error = {
                isAxiosError: true,
                response: {
                    data: {},
                },
                message: 'Network error',
            };

            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;
            const message = getErrorMessage(error);
            expect(message).toBe('Network error');
        });

        it('should handle regular Error objects', () => {
            const error = new Error('Regular error');
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(false) as any;

            const message = getErrorMessage(error);
            expect(message).toBe('Regular error');
        });

        it('should handle unknown errors', () => {
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(false) as any;
            const message = getErrorMessage('string error');
            expect(message).toBe('An unknown error occurred');
        });
    });
});
