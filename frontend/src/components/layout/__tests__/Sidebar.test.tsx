import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

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

jest.mock('@/contexts/WorkspaceContext', () => ({
  useWorkspace: jest.fn(),
}));

jest.mock('@/components/layout/WorkspaceSwitcher', () => ({
  WorkspaceSwitcher: () => <div data-testid="workspace-switcher" />,
}));

jest.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

jest.mock('@/contexts/MobileMenuContext', () => ({
  useMobileMenu: jest.fn(),
}));

describe('Sidebar', () => {
  const mockCan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useWorkspace as jest.Mock).mockReturnValue({
      can: mockCan,
    });
    (useMobileMenu as jest.Mock).mockReturnValue({
      isOpen: false,
      close: jest.fn(),
    });
    mockCan.mockReturnValue(true);
  });

  it('renders sidebar and app title', () => {
    render(<Sidebar />);
    expect(screen.getByText(/harbaat ai/i)).toBeInTheDocument();
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

    expect(screen.getByText(/all meetings/i)).toBeInTheDocument();
    expect(screen.getByText(/projects/i)).toBeInTheDocument();
  });

  it('renders new meeting button when user has permission', () => {
    mockCan.mockReturnValue(true);
    render(<Sidebar />);

    expect(screen.getByText(/new meeting/i)).toBeInTheDocument();
  });

  it('hides new meeting button when user lacks permission', () => {
    mockCan.mockReturnValue(false);
    render(<Sidebar />);

    expect(screen.queryByText(/new meeting/i)).not.toBeInTheDocument();
  });

  it('renders user information', () => {
    render(<Sidebar />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
