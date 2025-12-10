import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// Mock dependencies
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

jest.mock('next-themes', () => ({
    useTheme: jest.fn(() => ({ theme: 'light', setTheme: jest.fn() })),
}));

describe('Sidebar', () => {
    beforeEach(() => {
        (useSession as jest.Mock).mockReturnValue({
            data: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                },
            },
        });
        (usePathname as jest.Mock).mockReturnValue('/dashboard');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders sidebar', () => {
        const { container } = render(<Sidebar />);

        const sidebar = container.querySelector('aside');
        expect(sidebar).toBeInTheDocument();
    });

    it('has fixed positioning classes', () => {
        const { container } = render(<Sidebar />);

        const sidebar = container.querySelector('aside');
        expect(sidebar?.className).toContain('fixed');
    });

    it('renders app title', () => {
        render(<Sidebar />);

        expect(screen.getByText('HarBaat AI')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(<Sidebar />);

        expect(screen.getByText('All Meetings')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('renders new meeting button', () => {
        render(<Sidebar />);

        expect(screen.getByText('New Meeting')).toBeInTheDocument();
    });

    it('renders user information', () => {
        render(<Sidebar />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
    });
});
