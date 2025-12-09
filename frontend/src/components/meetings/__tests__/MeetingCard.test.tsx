import { render, screen } from '@testing-library/react';
import { MeetingCard } from '../MeetingCard';
import type { Meeting } from '@/types/domain.types';

const mockMeeting: Meeting = {
    id: 'meeting-123',
    title: 'Team Standup',
    status: 'completed',
    createdAt: new Date('2025-01-15T10:30:00Z'),
};

describe('MeetingCard', () => {
    it('should render meeting title', () => {
        render(<MeetingCard meeting={mockMeeting} />);
        expect(screen.getByText('Team Standup')).toBeInTheDocument();
    });

    it('should render default title when no title provided', () => {
        const meetingWithoutTitle = { ...mockMeeting, title: null };
        render(<MeetingCard meeting={meetingWithoutTitle} />);
        expect(screen.getByText(/Meeting meeting-/)).toBeInTheDocument();
    });

    it('should render status badge', () => {
        render(<MeetingCard meeting={mockMeeting} />);
        expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render formatted date', () => {
        render(<MeetingCard meeting={mockMeeting} />);
        // Date formatting may vary by locale
        expect(screen.getByText(/Jan/)).toBeInTheDocument();
    });

    it('should have link to meeting detail page', () => {
        render(<MeetingCard meeting={mockMeeting} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/meetings/meeting-123');
    });
});
