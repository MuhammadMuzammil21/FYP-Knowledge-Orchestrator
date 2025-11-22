import { useQuery } from '@tanstack/react-query';
import { meetingsApi } from '../../../src/lib/api/meetings';
import { QUERY_KEYS } from '../../../src/config/constants';
import type { TranscriptResponse, Entities, SearchResponse } from '../../../src/types';

/**
 * Hook to fetch meeting transcript
 */
export function useTranscript(meetingId: string) {
  return useQuery<TranscriptResponse, Error>({
    queryKey: QUERY_KEYS.transcript(meetingId),
    queryFn: () => meetingsApi.getTranscript(meetingId),
    enabled: !!meetingId,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to fetch extracted entities
 */
export function useEntities(meetingId: string) {
  return useQuery<Entities, Error>({
    queryKey: QUERY_KEYS.entities(meetingId),
    queryFn: () => meetingsApi.getEntities(meetingId),
    enabled: !!meetingId,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to search transcript
 */
export function useSearchTranscript(meetingId: string, query: string) {
  return useQuery<SearchResponse, Error>({
    queryKey: QUERY_KEYS.search(meetingId, query),
    queryFn: () => meetingsApi.searchTranscript(meetingId, query),
    enabled: !!meetingId && !!query && query.length >= 2,
    staleTime: 60000, // 1 minute
  });
}