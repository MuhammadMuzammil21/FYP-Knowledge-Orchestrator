import { useEffect, useState, useRef } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/constants';

interface UseTranscriptStreamOptions {
    meetingId: string;
    enabled?: boolean;
    onPartial?: (text: string) => void;
    onDone?: () => void;
    onError?: (error: Error) => void;
}

export function useTranscriptStream({
    meetingId,
    enabled = true,
    onPartial,
    onDone,
    onError,
}: UseTranscriptStreamOptions) {
    const [transcript, setTranscript] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!enabled || !meetingId) return;

        const url = `${API_BASE_URL}${API_ENDPOINTS.MEETING_TRANSCRIPT_STREAM(meetingId)}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;
        setIsStreaming(true);

        eventSource.addEventListener('partial', (event) => {
            try {
                const data = JSON.parse(event.data);
                const newText = data.text || '';

                setTranscript((prev) => prev + newText);
                onPartial?.(newText);
            } catch (error) {
                onError?.(error as Error);
            }
        });

        eventSource.addEventListener('done', () => {
            setIsStreaming(false);
            onDone?.();
            eventSource.close();
        });

        eventSource.onerror = (error) => {
            setIsStreaming(false);
            onError?.(new Error('Stream connection error'));
            eventSource.close();
        };

        return () => {
            eventSource.close();
            setIsStreaming(false);
        };
    }, [meetingId, enabled, onPartial, onDone, onError]);

    const stopStream = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            setIsStreaming(false);
        }
    };

    return { transcript, isStreaming, stopStream };
}
