/**
 * Domain Types
 * Application domain models (frontend representation)
 * These types represent how data is used in the application
 */

/**
 * User domain model
 */
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * Meeting domain model
 */
export interface Meeting {
  id: string;
  title: string | null;
  status: MeetingStatus;
  createdAt: Date;
}

/**
 * Meeting list with metadata
 */
export interface MeetingList {
  meetings: Meeting[];
  totalCount: number;
}

/**
 * Meeting detail domain model
 */
export interface MeetingDetail {
  id: string;
  projectId: string;
  teamId?: string | null;
  status: MeetingStatus;
  stage: ProcessingStage;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
  insightsReady: boolean;
}

/**
 * Meeting status types
 */
export type MeetingStatus = 'queued' | 'processing' | 'completed' | 'error';

/**
 * Processing stage types
 */
export type ProcessingStage =
  | 'asr_pending'
  | 'asr_processing'
  | 'asr_done'
  | 'llm_cleanup'
  | 'llm_done'
  | 'insights_processing'
  | 'completed'
  | 'error';

/**
 * Meeting status detail domain model
 */
export interface MeetingStatusDetail {
  id: string;
  status: MeetingStatus;
  stage: ProcessingStage;
  progress: number;
  asr: ASRStatus;
  llmCleanup: LLMStatus;
  background: BackgroundStatus;
  finalTranscriptReady: boolean;
  insightsReady: boolean;
}

/**
 * ASR status
 */
export interface ASRStatus {
  done: boolean;
  transcriptRawAvailable: boolean;
}

/**
 * LLM status
 */
export interface LLMStatus {
  done: boolean;
  streamingAvailable: boolean;
}

/**
 * Background processing status
 */
export interface BackgroundStatus {
  conflicts: string;
  knowledgeGraph: string;
  rag: string;
}

/**
 * Transcript domain model
 */
export interface Transcript {
  meetingId: string;
  type: 'raw' | 'final';
  content: string;
  version: number;
  isLlmRewritten: boolean;
  language?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Entity domain models
 */
export interface Task {
  assignee: string;
  task: string;
  due: string;
}

export interface Decision {
  statement: string;
  decidedBy: string;
  timestamp: number;
}

export interface Entities {
  speakers?: string[];
  topics?: string[];
  tasks?: Task[];
  decisions?: Decision[];
  [key: string]: any;
}

/**
 * Search result domain model
 */
export interface SearchResult {
  snippet: string;
  timestamp: number | null;
}

/**
 * RAG context domain model
 */
export interface RAGContext {
  chunk: string;
  score: number;
}

/**
 * RAG response domain model
 */
export interface RAGResponse {
  answer: string;
  context: RAGContext[];
}

/**
 * Conflict domain model
 */
export interface Conflict {
  type: string;
  description: string;
  severity: string;
  relatedMeetingId?: string;
  [key: string]: any;
}

/**
 * Authentication domain models
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

/**
 * Speaker domain models
 */
export interface Speaker {
  id: number;
  originalLabel: string;
  displayName: string;
  meetingId: string;
}

export interface SpeakerMapping {
  originalLabel: string;
  displayName: string;
}

/**
 * Knowledge Graph domain models
 */
export interface GraphNode {
  id: number;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphEdge {
  type: string;
  start: number;
  end: number;
  properties: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Person Tasks domain models
 */
export interface TaskInfo {
  id: string;
  description: string;
  dueDate: string | null;
  status: string;
  meetingId: string;
  meetingTitle: string | null;
}

export interface PersonTasks {
  personName: string;
  tasks: TaskInfo[];
}
/**
 * Notification domain models
 */
export interface MeetingUploadResponse {
  meetingId: string;
  projectId: string;
  status: string;
  stage: string;
  message: string;
}

export interface Notification {
  id: number;
  meetingId?: string;
  type: 'mention' | 'summary' | 'conflict' | 'action_item' | 'team_invite';
  title: string;
  message: string;
  extraData: {
    absent?: boolean;
    projectId?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: Date;
}

export interface NotificationList {
  notifications: Notification[];
}
