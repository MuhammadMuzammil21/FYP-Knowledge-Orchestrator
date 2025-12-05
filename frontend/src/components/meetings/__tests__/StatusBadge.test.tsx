import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
    it('should render queued status', () => {
        render(<StatusBadge status="queued" />);
        expect(screen.getByText('Queued')).toBeInTheDocument();
    });

    it('should render processing status', () => {
        render(<StatusBadge status="processing" />);
        expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should render completed status', () => {
        render(<StatusBadge status="completed" />);
        expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render error status', () => {
        render(<StatusBadge status="error" />);
        expect(screen.getByText('Error')).toBeInTheDocument();
    });
});
