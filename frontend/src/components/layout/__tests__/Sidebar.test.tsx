import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { Sidebar } from '../Sidebar';

// Mock next-auth
jest.mock('next-auth/react');
const mockedUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('Sidebar', () => {
    beforeEach(() => {
        mockedUseSession.mockReturnValue({
            data: {
                user: {
                    id: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                    created_at: '2025-01-01',
                    email_verified: true,
                },
                accessToken: 'test-token',
                expires: '2025-12-31',
            },
            status: 'authenticated',
            update: jest.fn(),
        });
    });

    it('should render sidebar with branding', () => {
        render(<Sidebar />);

        expect(screen.getByText('HarBaat AI')).toBeInTheDocument();
    });

    it('should render new meeting button', () => {
        render(<Sidebar />);

        const newMeetingButton = screen.getByRole('link', { name: /new meeting/i });
        expect(newMeetingButton).toBeInTheDocument();
        expect(newMeetingButton).toHaveAttribute('href', '/dashboard');
    });

    it('should render today section with meetings link', () => {
        render(<Sidebar />);

        expect(screen.getByText('Today')).toBeInTheDocument();
        const meetingsLink = screen.getByRole('link', { name: /all meetings/i });
        expect(meetingsLink).toBeInTheDocument();
        expect(meetingsLink).toHaveAttribute('href', '/meetings');
    });

    it('should render settings link', () => {
        render(<Sidebar />);

        expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('should display user name in user menu', () => {
        render(<Sidebar />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should render user dropdown menu trigger', () => {
        render(<Sidebar />);

        const userButton = screen.getByRole('button', { name: /test user/i });
        expect(userButton).toBeInTheDocument();
    });
});
