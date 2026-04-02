import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';
import type { MeetingStatusDetail } from '@/types/domain.types';

const mockStatus: MeetingStatusDetail = {
    id: 'meeting-123',
    status: 'processing',
    stage: 'llm_cleanup',
    progress: 45,
    asr: { done: true, transcriptRawAvailable: true },
    llmCleanup: { done: false, streamingAvailable: true },
    background: { conflicts: 'pending', knowledgeGraph: 'pending', rag: 'pending' },
    finalTranscriptReady: false,
    insightsReady: false,
};

describe('ProgressBar', () => {
    it('should render progress percentage', () => {
        render(<ProgressBar status={mockStatus} />);

        expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should render stage label', () => {
        render(<ProgressBar status={mockStatus} />);

        expect(screen.getByText('Cleaning transcript')).toBeInTheDocument();
    });

    it('should show processing message when status is processing', () => {
        render(<ProgressBar status={mockStatus} />);

        expect(screen.getByText('Processing in progress...')).toBeInTheDocument();
    });

    it('should not show processing message when completed', () => {
        const completedStatus = { ...mockStatus, status: 'completed' as const };
        render(<ProgressBar status={completedStatus} />);

        expect(screen.queryByText('Processing in progress...')).not.toBeInTheDocument();
    });
});
