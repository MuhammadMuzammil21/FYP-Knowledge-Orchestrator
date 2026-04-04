import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import SignupPage from '../(auth)/signup/page';
import * as authApi from '@/lib/api/auth';

// Mock next-auth
jest.mock('next-auth/react');
const mockedSignIn = signIn as jest.MockedFunction<typeof signIn>;

// Mock auth API
jest.mock('@/lib/api/auth');
const mockedSignup = authApi.signup as jest.MockedFunction<typeof authApi.signup>;

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render signup form', () => {
    render(<SignupPage />);

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('should show error when passwords do not match', async () => {
    render(<SignupPage />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    // Toast error will be shown (mocked in jest.setup.ts)
    await waitFor(() => {
      expect(mockedSignup).not.toHaveBeenCalled();
    });
  });

  it('should show error for short password', async () => {
    render(<SignupPage />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedSignup).not.toHaveBeenCalled();
    });
  });

  it('should call signup API with user data', async () => {
    const mockResponse = {
      access_token: 'test-token',
      token_type: 'bearer',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2025-01-01',
        email_verified: false,
      },
    };

    mockedSignup.mockResolvedValue(mockResponse);
    mockedSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null } as any);

    render(<SignupPage />);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedSignup).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should auto-login and redirect after successful signup', async () => {
    const mockResponse = {
      access_token: 'test-token',
      token_type: 'bearer',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2025-01-01',
        email_verified: false,
      },
    };

    mockedSignup.mockResolvedValue(mockResponse);
    mockedSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null } as any);

    render(<SignupPage />);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/verify-email');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('should have link to login page', () => {
    render(<SignupPage />);

    const loginLink = screen.getByText('Sign in');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
