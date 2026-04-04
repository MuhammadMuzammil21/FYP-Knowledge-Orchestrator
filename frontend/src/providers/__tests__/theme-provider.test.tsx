import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/providers/theme-provider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('accepts theme provider props', () => {
    const { container } = render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(container).toBeInTheDocument();
  });
});
