import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMeetings } from '../useMeetings';
import * as meetingsApi from '@/lib/api/meetings';

// Mock meetings API
jest.mock('@/lib/api/meetings');
const mockedGetMeetings = meetingsApi.getMeetings as jest.MockedFunction<typeof meetingsApi.getMeetings>;

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
    it('should fetch meetings successfully', async () => {
        const mockData = {
            meetings: [
                {
                    meeting_id: '1',
                    title: 'Test Meeting',
                    status: 'completed' as const,
                    created_at: '2025-01-01',
                },
            ],
        };

        mockedGetMeetings.mockResolvedValue(mockData);

        const { result } = renderHook(() => useMeetings(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockData);
        expect(mockedGetMeetings).toHaveBeenCalled();
    });

    it('should pass pagination params to API', async () => {
        const mockData = { meetings: [] };
        mockedGetMeetings.mockResolvedValue(mockData);

        const { result } = renderHook(
            () => useMeetings({ limit: 10, offset: 20 }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockedGetMeetings).toHaveBeenCalledWith({ limit: 10, offset: 20 });
    });
});
