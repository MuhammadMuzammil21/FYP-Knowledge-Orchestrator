import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has accessibility label', () => {
    render(<ThemeToggle />);

    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('renders sun and moon icons', () => {
    const { container } = render(<ThemeToggle />);

    // Check that SVG icons are present
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('uses theme from useTheme hook', () => {
    render(<ThemeToggle />);

    expect(useTheme).toHaveBeenCalled();
  });
});
