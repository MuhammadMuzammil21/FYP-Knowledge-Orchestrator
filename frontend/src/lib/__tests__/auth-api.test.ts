import { login, signup, verifyEmail, resetPassword, updateUserProfile } from '../api/auth';
import apiClient from '../api/client';

// Mock the API client
jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call login endpoint with credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'bearer',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            created_at: '2025-01-01',
            email_verified: true,
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('signup', () => {
    it('should call signup endpoint with user data', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'bearer',
          user: {
            id: '1',
            name: 'New User',
            email: 'new@example.com',
            created_at: '2025-01-01',
            email_verified: false,
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await signup({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/signup', {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('verifyEmail', () => {
    it('should call verify-email endpoint with token', async () => {
      const mockResponse = {
        data: {
          message: 'Email verified successfully',
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await verifyEmail('test-token');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/verify-email', {
        token: 'test-token',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('resetPassword', () => {
    it('should call reset-password endpoint with token and new password', async () => {
      const mockResponse = {
        data: {
          message: 'Password reset successfully',
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await resetPassword('reset-token', 'newpassword123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        token: 'reset-token',
        new_password: 'newpassword123',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile name', async () => {
      const mockResponse = {
        data: {
          id: '1',
          name: 'Updated Name',
          email: 'test@example.com',
          created_at: '2025-01-01',
          email_verified: true,
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await updateUserProfile({ name: 'Updated Name' });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/users/me', {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should call correct endpoint /api/users/me', async () => {
      const mockResponse = {
        data: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          created_at: '2025-01-01',
          email_verified: true,
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      await updateUserProfile({ name: 'Test User' });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/users/me', {
        name: 'Test User',
      });
    });

    it('should return updated user object', async () => {
      const mockResponse = {
        data: {
          id: '1',
          name: 'New Name',
          email: 'test@example.com',
          created_at: '2025-01-01',
          email_verified: true,
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await updateUserProfile({ name: 'New Name' });

      expect(result).toEqual(mockResponse.data);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
    });

    it('should handle validation errors', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Validation failed'));

      await expect(updateUserProfile({ name: '' })).rejects.toThrow('Validation failed');
    });
  });
});
