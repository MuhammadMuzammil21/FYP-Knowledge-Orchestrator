import { render, screen, fireEvent } from '@testing-library/react';
import { TranscriptViewer } from '../TranscriptViewer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockTranscript = `Speaker 1: Hello everyone, welcome to the meeting.
Speaker 2: Thanks for having us.
Speaker 1: Let's discuss the project timeline.
Speaker 2: I think we should aim for Q2 delivery.`;

// Wrap in QueryClientProvider since TranscriptViewer uses hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
    }
  >
    {children}
  </QueryClientProvider>
);

describe('TranscriptViewer', () => {
  it('should render transcript segments', () => {
    render(<TranscriptViewer meetingId="test-123" transcript={mockTranscript} />, { wrapper });

    expect(screen.getAllByText('Speaker 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Speaker 2').length).toBeGreaterThan(0);
    expect(screen.getByText(/Hello everyone/)).toBeInTheDocument();
  });

  it('should show AI Enhanced badge when transcript is LLM rewritten', () => {
    render(
      <TranscriptViewer meetingId="test-123" transcript={mockTranscript} isLlmRewritten={true} />,
      { wrapper }
    );

    expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
  });

  it('should filter transcript based on search query', () => {
    render(<TranscriptViewer meetingId="test-123" transcript={mockTranscript} />, { wrapper });

    const searchInput = screen.getByPlaceholderText(/search transcript/i);
    fireEvent.change(searchInput, { target: { value: 'timeline' } });

    expect(screen.getByText(/timeline/i)).toBeInTheDocument();
  });

  it('should show results count when searching', () => {
    render(<TranscriptViewer meetingId="test-123" transcript={mockTranscript} />, { wrapper });

    const searchInput = screen.getByPlaceholderText(/search transcript/i);
    fireEvent.change(searchInput, { target: { value: 'Speaker' } });

    expect(screen.getByText(/Found \d+ results?/)).toBeInTheDocument();
  });

  it('should show empty state when transcript is empty', () => {
    render(<TranscriptViewer meetingId="test-123" transcript="" />, { wrapper });

    expect(screen.getByText('No transcript available')).toBeInTheDocument();
  });
});
