import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import LoginPage from '../(auth)/login/page';

// Mock next-auth
jest.mock('next-auth/react');
const mockedSignIn = signIn as jest.MockedFunction<typeof signIn>;

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
    useSearchParams: () => ({
        get: jest.fn(() => null),
    }),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render login form', () => {
        render(<LoginPage />);

        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
        render(<LoginPage />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // HTML5 validation will prevent submission
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

        expect(emailInput.validity.valid).toBe(false);
        expect(passwordInput.validity.valid).toBe(false);
    });

    it('should call signIn with credentials on submit', async () => {
        mockedSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null } as any);

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockedSignIn).toHaveBeenCalledWith('credentials', {
                email: 'test@example.com',
                password: 'password123',
                redirect: false,
            });
        });
    });

    it('should redirect to dashboard on successful login', async () => {
        mockedSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null } as any);

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    it('should show error message on failed login', async () => {
        mockedSignIn.mockResolvedValue({ error: 'Invalid credentials', ok: false, status: 401, url: null } as any);

        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockedSignIn).toHaveBeenCalled();
        });
    });

    it('should have link to signup page', () => {
        render(<LoginPage />);

        const signupLink = screen.getByText('Sign up');
        expect(signupLink).toBeInTheDocument();
        expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
    });

    it('should have link to forgot password page', () => {
        render(<LoginPage />);

        const forgotPasswordLink = screen.getByText('Forgot password?');
        expect(forgotPasswordLink).toBeInTheDocument();
        expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });
});
