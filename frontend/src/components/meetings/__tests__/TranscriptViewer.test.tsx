import { render, screen, fireEvent } from '@testing-library/react';
import { TranscriptViewer } from '../TranscriptViewer';

const mockTranscript = `Speaker 1: Hello everyone, welcome to the meeting.
Speaker 2: Thanks for having us.
Speaker 1: Let's discuss the project timeline.
Speaker 2: I think we should aim for Q2 delivery.`;

describe('TranscriptViewer', () => {
    it('should render transcript segments', () => {
        render(<TranscriptViewer transcript={mockTranscript} />);

        expect(screen.getAllByText('Speaker 1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Speaker 2').length).toBeGreaterThan(0);
        expect(screen.getByText(/Hello everyone/)).toBeInTheDocument();
    });

    it('should show AI Enhanced badge when transcript is LLM rewritten', () => {
        render(<TranscriptViewer transcript={mockTranscript} isLlmRewritten={true} />);

        expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
    });

    it('should filter transcript based on search query', () => {
        render(<TranscriptViewer transcript={mockTranscript} />);

        const searchInput = screen.getByPlaceholderText(/search in transcript/i);
        fireEvent.change(searchInput, { target: { value: 'timeline' } });

        expect(screen.getByText(/timeline/i)).toBeInTheDocument();
        expect(screen.queryByText(/Thanks for having us/)).not.toBeInTheDocument();
    });

    it('should show results count when searching', () => {
        render(<TranscriptViewer transcript={mockTranscript} />);

        const searchInput = screen.getByPlaceholderText(/search in transcript/i);
        fireEvent.change(searchInput, { target: { value: 'Speaker' } });

        expect(screen.getByText(/Found \d+ results?/)).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
        render(<TranscriptViewer transcript={mockTranscript} />);

        const searchInput = screen.getByPlaceholderText(/search in transcript/i);
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should show empty state when transcript is empty', () => {
        render(<TranscriptViewer transcript="" />);

        expect(screen.getByText('No transcript available')).toBeInTheDocument();
    });
});
