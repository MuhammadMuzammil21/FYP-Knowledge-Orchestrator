import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMeetings } from '../useMeetings';
import { meetingService } from '@/lib/services';

// Mock meeting service
jest.mock('@/lib/services', () => ({
  meetingService: {
    getMeetings: jest.fn(),
  },
}));

const mockedGetMeetings = meetingService.getMeetings as jest.MockedFunction<
  typeof meetingService.getMeetings
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMeetings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch meetings successfully', async () => {
    const mockData = [
      {
        id: '1',
        title: 'Test Meeting',
        status: 'completed' as const,
        createdAt: new Date('2025-01-01'),
      },
    ];

    mockedGetMeetings.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMeetings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(mockedGetMeetings).toHaveBeenCalled();
  });

  it('should pass pagination params to API', async () => {
    const mockData: any[] = [];
    mockedGetMeetings.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMeetings({ limit: 10, offset: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetMeetings).toHaveBeenCalledWith({ limit: 10, offset: 20 });
  });
});
