/**
 * API Response Adapters
 * Transform API responses (snake_case) to domain models (camelCase)
 *
 * Benefits:
 * - Decouple frontend from backend naming conventions
 * - Easy to adapt when API structure changes
 * - Consistent data shapes across application
 */

import type {
  User,
  Meeting,
  MeetingDetail,
  MeetingStatusDetail,
  Transcript,
  Entities,
  SearchResult,
  RAGResponse,
  Conflict,
  TokenResponse,
  MeetingList,
} from '@/types/domain.types';

/**
 * Adapt user response from API
 */
export const adaptUser = (apiUser: any): User => {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    emailVerified: apiUser.email_verified ?? false,
    createdAt: new Date(apiUser.created_at),
  };
};

/**
 * Adapt meeting response from API
 */
export const adaptMeeting = (apiMeeting: any): Meeting => {
  return {
    id: apiMeeting.meeting_id,
    title: apiMeeting.title,
    status: apiMeeting.status,
    createdAt: new Date(apiMeeting.created_at),
  };
};

/**
 * Adapt meeting list response from API
 */
export const adaptMeetingList = (apiResponse: any): MeetingList => {
  return {
    meetings: apiResponse.meetings?.map(adaptMeeting) ?? [],
    totalCount: apiResponse.total_count ?? 0,
  };
};

/**
 * Adapt meeting detail response from API
 */
export const adaptMeetingDetail = (apiDetail: any): MeetingDetail => {
  return {
    id: apiDetail.meeting_id,
    projectId: apiDetail.project_id,
    teamId: apiDetail.team_id,
    status: apiDetail.status,
    stage: apiDetail.stage,
    durationSeconds: apiDetail.duration_seconds,
    createdAt: new Date(apiDetail.created_at),
    updatedAt: new Date(apiDetail.updated_at),
    insightsReady: apiDetail.insights_ready ?? false,
  };
};

/**
 * Adapt meeting status detail response from API
 */
export const adaptMeetingStatus = (apiStatus: any): MeetingStatusDetail => {
  return {
    id: apiStatus.meeting_id,
    status: apiStatus.status,
    stage: apiStatus.stage,
    progress: apiStatus.progress ?? 0,
    asr: {
      done: apiStatus.asr?.done ?? false,
      transcriptRawAvailable: apiStatus.asr?.transcript_raw_available ?? false,
    },
    llmCleanup: {
      done: apiStatus.llm_cleanup?.done ?? false,
      streamingAvailable: apiStatus.llm_cleanup?.streaming_available ?? false,
    },
    background: {
      conflicts: apiStatus.background?.conflicts ?? 'pending',
      knowledgeGraph: apiStatus.background?.knowledge_graph ?? 'pending',
      rag: apiStatus.background?.rag ?? 'pending',
    },
    finalTranscriptReady: apiStatus.final_transcript_ready ?? false,
    insightsReady: apiStatus.insights_ready ?? false,
  };
};

/**
 * Adapt transcript response from API
 */
export const adaptTranscript = (apiTranscript: any): Transcript => {
  return {
    meetingId: apiTranscript.meeting_id,
    type: apiTranscript.type,
    content: apiTranscript.transcript,
    isLlmRewritten: apiTranscript.is_llm_rewritten ?? false,
  };
};

/**
 * Adapt entities response from API
 */
export const adaptEntities = (apiEntities: any): Entities => {
  return {
    speakers: apiEntities.speakers,
    topics: apiEntities.topics,
    tasks: apiEntities.tasks,
    decisions: apiEntities.decisions,
    ...apiEntities, // Keep any additional fields
  };
};

/**
 * Adapt search results from API
 */
export const adaptSearchResults = (apiResponse: any): SearchResult[] => {
  return (
    apiResponse.results?.map((result: any) => ({
      snippet: result.snippet,
      timestamp: result.timestamp,
    })) ?? []
  );
};

/**
 * Adapt RAG response from API
 */
export const adaptRAGResponse = (apiResponse: any): RAGResponse => {
  return {
    answer: apiResponse.answer,
    context:
      apiResponse.context?.map((ctx: any) => ({
        chunk: ctx.chunk,
        score: ctx.score,
      })) ?? [],
  };
};

/**
 * Adapt conflicts from API
 */
export const adaptConflicts = (apiResponse: any): Conflict[] => {
  return (
    apiResponse.conflicts?.map((conflict: any) => ({
      type: conflict.type,
      description: conflict.description,
      severity: conflict.severity,
      relatedMeetingId: conflict.related_meeting_id,
      ...conflict, // Keep any additional fields
    })) ?? []
  );
};

/**
 * Adapt token response from API
 */
export const adaptTokenResponse = (apiResponse: any): TokenResponse => {
  return {
    accessToken: apiResponse.access_token,
    tokenType: apiResponse.token_type,
    user: adaptUser(apiResponse.user),
  };
};

/**
 * Adapt meeting upload response from API
 */
export const adaptMeetingUploadResponse = (apiResponse: any) => {
  return {
    meetingId: apiResponse.meeting_id,
    projectId: apiResponse.project_id,
    status: apiResponse.status,
    stage: apiResponse.stage,
    message: apiResponse.message,
  };
};

/**
 * Adapt speakers response from API
 */
export const adaptSpeakers = (apiResponse: any): import('@/types/domain.types').Speaker[] => {
  if (!apiResponse || !Array.isArray(apiResponse)) return [];

  return apiResponse.map((speaker: any) => ({
    id: speaker.id,
    originalLabel: speaker.original_label,
    displayName: speaker.display_name,
    meetingId: speaker.meeting_id,
  }));
};

/**
 * Adapt knowledge graph response from API
 */
export const adaptKnowledgeGraph = (
  apiResponse: any
): import('@/types/domain.types').KnowledgeGraph => {
  return {
    nodes:
      apiResponse.nodes?.map((node: any) => ({
        id: node.id,
        labels: node.labels,
        properties: node.properties,
      })) ?? [],
    edges:
      apiResponse.edges?.map((edge: any) => ({
        type: edge.type,
        start: edge.start,
        end: edge.end,
        properties: edge.properties,
      })) ?? [],
  };
};

/**
 * Adapt person tasks response from API
 */
export const adaptPersonTasks = (apiResponse: any): import('@/types/domain.types').PersonTasks => {
  return {
    personName: apiResponse.person_name,
    tasks:
      apiResponse.tasks?.map((task: any) => ({
        id: task.id,
        description: task.description,
        dueDate: task.due_date,
        status: task.status,
        meetingId: task.meeting_id,
        meetingTitle: task.meeting_title,
      })) ?? [],
  };
};
