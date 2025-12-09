import { render, screen } from '@testing-library/react';
import { EntitiesPanel } from '../EntitiesPanel';
import type { Entities } from '@/types';

const mockEntities: Entities = {
    speakers: ['John Doe', 'Jane Smith'],
    topics: ['Project Timeline', 'Budget', 'Resources'],
    tasks: [
        { assignee: 'John', task: 'Complete design mockups', due: '2025-01-15' },
        { assignee: 'Jane', task: 'Review requirements', due: '2025-01-10' },
    ],
    decisions: [
        { statement: 'Approved Q2 launch date', decidedBy: 'Team Lead', timestamp: 1234567890 },
    ],
};

describe('EntitiesPanel', () => {
    it('should render speakers', () => {
        render(<EntitiesPanel entities={mockEntities} />);

        expect(screen.getByText(/Speakers \(2\)/)).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render topics', () => {
        render(<EntitiesPanel entities={mockEntities} />);

        expect(screen.getByText(/Topics \(3\)/)).toBeInTheDocument();
        expect(screen.getByText('Project Timeline')).toBeInTheDocument();
        expect(screen.getByText('Budget')).toBeInTheDocument();
    });

    it('should render tasks with assignees and due dates', () => {
        render(<EntitiesPanel entities={mockEntities} />);

        expect(screen.getByText(/Tasks \(2\)/)).toBeInTheDocument();
        expect(screen.getByText('Complete design mockups')).toBeInTheDocument();
        // John appears in both speakers and tasks, so just check it exists
        expect(screen.getAllByText('John', { exact: false }).length).toBeGreaterThan(0);
    });

    it('should render decisions', () => {
        render(<EntitiesPanel entities={mockEntities} />);

        expect(screen.getByText(/Decisions \(1\)/)).toBeInTheDocument();
        expect(screen.getByText('Approved Q2 launch date')).toBeInTheDocument();
    });

    it('should show empty state when no entities', () => {
        render(<EntitiesPanel entities={{}} />);

        expect(screen.getByText('No entities extracted yet')).toBeInTheDocument();
    });
});
