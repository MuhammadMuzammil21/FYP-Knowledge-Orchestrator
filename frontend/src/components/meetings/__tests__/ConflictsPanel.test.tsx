import { render, screen } from '@testing-library/react';
import { ConflictsPanel } from '../ConflictsPanel';
import type { Conflict } from '@/types';

const mockConflicts: Conflict[] = [
    {
        type: 'Schedule Conflict',
        description: 'Meeting time overlaps with another project deadline',
        severity: 'high',
        related_meeting_id: 'meeting-456',
    },
    {
        type: 'Resource Allocation',
        description: 'Team member assigned to multiple tasks',
        severity: 'medium',
    },
    {
        type: 'Minor Discrepancy',
        description: 'Small difference in reported numbers',
        severity: 'low',
    },
];

describe('ConflictsPanel', () => {
    it('should render conflicts with severity indicators', () => {
        render(<ConflictsPanel conflicts={mockConflicts} />);

        expect(screen.getByText('Schedule Conflict')).toBeInTheDocument();
        expect(screen.getByText('Resource Allocation')).toBeInTheDocument();
        expect(screen.getByText('Minor Discrepancy')).toBeInTheDocument();
    });

    it('should show severity badges', () => {
        render(<ConflictsPanel conflicts={mockConflicts} />);

        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('MEDIUM')).toBeInTheDocument();
        expect(screen.getByText('LOW')).toBeInTheDocument();
    });

    it('should display conflict descriptions', () => {
        render(<ConflictsPanel conflicts={mockConflicts} />);

        expect(screen.getByText(/Meeting time overlaps/)).toBeInTheDocument();
        expect(screen.getByText(/Team member assigned/)).toBeInTheDocument();
    });

    it('should show related meeting ID when available', () => {
        render(<ConflictsPanel conflicts={mockConflicts} />);

        expect(screen.getByText(/Related Meeting:.*meeting-456/)).toBeInTheDocument();
    });

    it('should show empty state when no conflicts', () => {
        render(<ConflictsPanel conflicts={[]} />);

        expect(screen.getByText('No conflicts detected')).toBeInTheDocument();
    });

    it('should show conflict count', () => {
        render(<ConflictsPanel conflicts={mockConflicts} />);

        expect(screen.getByText(/Found 3 conflicts/)).toBeInTheDocument();
    });
});
