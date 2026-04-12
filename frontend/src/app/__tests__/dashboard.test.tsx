import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '../(dashboard)/dashboard/page';
import * as meetingsApi from '@/lib/api/meetings';

// Mock meetings API
jest.mock('@/lib/api/meetings');
const mockedUploadMeeting = meetingsApi.uploadMeeting as jest.MockedFunction<
  typeof meetingsApi.uploadMeeting
>;

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard with upload interface', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Upload Meeting Recording')).toBeInTheDocument();
    expect(screen.getByText('Get AI-powered insights from your meetings')).toBeInTheDocument();
  });

  it('should render context input', () => {
    render(<DashboardPage />);

    const contextInput = screen.getByPlaceholderText(/add context about this meeting/i);
    expect(contextInput).toBeInTheDocument();
  });

  it('should render file upload input', () => {
    render(<DashboardPage />);

    const fileInput = screen.getByLabelText(/upload recording/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('should show file info after selection', () => {
    render(<DashboardPage />);

    const file = new File(['audio content'], 'meeting.mp3', { type: 'audio/mpeg' });
    const fileInput = screen.getByLabelText(/upload recording/i) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/selected: meeting.mp3/i)).toBeInTheDocument();
  });

  it('should disable upload button when no file selected', () => {
    render(<DashboardPage />);

    const uploadButton = screen.getByRole('button', { name: /start analysis/i });
    expect(uploadButton).toBeDisabled();
  });

  it('should enable upload button when file is selected', () => {
    render(<DashboardPage />);

    const file = new File(['audio content'], 'meeting.mp3', { type: 'audio/mpeg' });
    const fileInput = screen.getByLabelText(/upload recording/i) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: /start analysis/i });
    expect(uploadButton).not.toBeDisabled();
  });

  it('should upload meeting and redirect on success', async () => {
    const mockResponse = {
      meetingId: 'meeting-123',
      projectId: 'default-project',
      status: 'queued' as const,
      stage: 'asr_pending' as const,
      message: 'Meeting uploaded successfully',
    };

    mockedUploadMeeting.mockResolvedValue(mockResponse);

    render(<DashboardPage />);

    const file = new File(['audio content'], 'meeting.mp3', { type: 'audio/mpeg' });
    const fileInput = screen.getByLabelText(/upload recording/i) as HTMLInputElement;
    const uploadButton = screen.getByRole('button', { name: /start analysis/i });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockedUploadMeeting).toHaveBeenCalledWith(
        file,
        'default-project',
        expect.objectContaining({
          context: undefined,
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/meetings/meeting-123');
    });
  });

  it('should upload meeting with context', async () => {
    const mockResponse = {
      meetingId: 'meeting-123',
      projectId: 'default-project',
      status: 'queued' as const,
      stage: 'asr_pending' as const,
      message: 'Meeting uploaded successfully',
    };

    mockedUploadMeeting.mockResolvedValue(mockResponse);

    render(<DashboardPage />);

    const file = new File(['audio content'], 'meeting.mp3', { type: 'audio/mpeg' });
    const fileInput = screen.getByLabelText(/upload recording/i) as HTMLInputElement;
    const contextInput = screen.getByPlaceholderText(/add context about this meeting/i);
    const uploadButton = screen.getByRole('button', { name: /start analysis/i });

    fireEvent.change(contextInput, { target: { value: 'Team standup meeting' } });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockedUploadMeeting).toHaveBeenCalledWith(
        file,
        'default-project',
        expect.objectContaining({
          context: 'Team standup meeting',
        })
      );
    });
  });

  it('should show error message on upload failure', async () => {
    mockedUploadMeeting.mockRejectedValue(new Error('Upload failed'));

    render(<DashboardPage />);

    const file = new File(['audio content'], 'meeting.mp3', { type: 'audio/mpeg' });
    const fileInput = screen.getByLabelText(/upload recording/i) as HTMLInputElement;
    const uploadButton = screen.getByRole('button', { name: /start analysis/i });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockedUploadMeeting).toHaveBeenCalled();
    });
  });
});
