// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  email_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

// Meeting Upload Metadata
export interface MeetingUploadMetadata {
  title?: string;
  language?: string;
  max_speakers?: number;
  num_speakers?: number;
  min_speakers?: number;
  context?: string;
}

// Meeting Types
export interface Meeting {
  meeting_id: string;
  title: string | null;
  status: MeetingStatus;
  created_at: string;
}

export interface MeetingDetail {
  meeting_id: string;
  project_id: string;
  team_id?: string | null;
  status: MeetingStatus;
  stage: ProcessingStage;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
  insights_ready: boolean;
}

export interface MeetingUploadResponse {
  meeting_id: string;
  project_id: string;
  team_id?: string | null;
  status: MeetingStatus;
  stage: ProcessingStage;
  message: string;
}

export type MeetingStatus = 'queued' | 'processing' | 'completed' | 'error';

export type ProcessingStage =
  | 'asr_pending'
  | 'asr_processing'
  | 'asr_done'
  | 'llm_cleanup'
  | 'llm_done'
  | 'insights_processing'
  | 'completed'
  | 'error';

// Status Types
export interface ASRStatus {
  done: boolean;
  transcript_raw_available: boolean;
}

export interface LLMStatus {
  done: boolean;
  streaming_available: boolean;
}

export interface BackgroundStatus {
  conflicts: string;
  knowledge_graph: string;
  rag: string;
}

export interface MeetingStatusDetail {
  meeting_id: string;
  status: MeetingStatus;
  stage: ProcessingStage;
  progress: number; // 0-100
  asr: ASRStatus;
  llm_cleanup: LLMStatus;
  background: BackgroundStatus;
  final_transcript_ready: boolean;
  insights_ready: boolean;
}

// Transcript Types
export interface TranscriptResponse {
  meeting_id: string;
  type: 'raw' | 'final';
  transcript: string;
  is_llm_rewritten: boolean;
  version: number;
  created_at: string;
}

// Entity Types
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

export interface EntityResponse {
  meeting_id: string;
  entities: Entities;
}

// Search Types
export interface SearchResult {
  snippet: string;
  timestamp: number | null;
}

export interface SearchResponse {
  results: SearchResult[];
}

// RAG Types
export interface RAGContext {
  chunk: string;
  score: number;
}

export interface RAGResponse {
  answer: string;
  context: RAGContext[];
}

// Conflict Types
export interface Conflict {
  id?: number;
  type: string;
  description: string;
  severity: string;
  related_meeting_id?: string;
  source_meeting_id?: string;
  target_meeting_id?: string;
  resolved?: boolean;
  resolution_note?: string;
  [key: string]: any;
}

export interface ConflictResponse {
  meeting_id: string;
  conflicts: Conflict[];
}

// Pagination
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total_count: number;
}

// API Error
export interface APIError {
  detail: string | ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  team_id?: string | null;
  created_at: string;
  meeting_count: number;
}

export interface ProjectDetail extends Project {
  updated_at: string;
  meeting_count: number;
  meetings: Meeting[];
}

export interface ProjectListResponse {
  projects: Project[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  team_id?: string;
}

// Conflict Types (Project-level)
export interface ConflictDetail {
  id: number;
  source_meeting_id: string;
  target_meeting_id: string;
  conflict_type: 'task_reassignment' | 'deadline_change' | 'decision_reversal' | 'general' | 'assignment_conflict' | 'dependency_conflict';
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  created_at: string;
  resolution_note?: string;
}

export interface ProjectConflictsResponse {
  project_id: string;
  total_conflicts: number;
  conflicts: ConflictDetail[];
}

export interface ResolveConflictRequest {
  resolved: boolean;
  resolution_note?: string;
}

// Speaker Types
export interface Speaker {
  id: number;
  original_label: string;
  display_name: string;
  known_speaker_id: number | null;
  has_embedding: boolean;
  linked_user_id?: string;
  neo4j_person_name?: string;
}

export interface SpeakersResponse {
  speakers: Speaker[];
}

export interface AddSpeakerRequest {
  original_label: string;
  display_name: string;
}

export interface SpeakerReviewProposal {
  id: number;
  meeting_id: string;
  speaker_mapping_id: number;
  proposed_name: string;
  evidence_snippet: string | null;
  evidence_timestamp: number | null;
  source: 'rag_scan' | 'manual';
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export interface ForceLinkEmailRequest {
  email: string;
}

export interface ForceLinkEmailResponse {
  linked_user_id?: string;
  linked_user_name?: string;
  affected_meetings: number;
  dry_run: boolean;
}

export interface GlobalSpeakerUserLinkRequest {
  user_id?: string;
  email?: string;
}

// Knowledge Graph Types
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

export interface ProjectGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface MeetingGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  participants: Array<{
    name: string;
    created_at: string;
  }>;
  tasks: Array<{
    id: string;
    description: string;
    assignee: string;
    due_date: string | null;
    created_at: string;
  }>;
  decisions: Array<{
    id: string;
    description: string;
    created_at: string;
  }>;
  topics: string[];
}

export interface PersonTask {
  id: string;
  description: string;
  due_date: string | null;
  status: string;
  meeting_id: string;
  meeting_title: string;
}

export interface PersonTasksResponse {
  person_name: string;
  tasks: PersonTask[];
}

// Known Speaker Types
export interface KnownSpeaker {
  id: number;
  name: string;
  status: 'unlinked' | 'named' | 'account_linked';
  is_external?: boolean;
  meeting_count: number;
  created_at: string;
}

export interface UnlinkedSpeakerPrompt {
  id: number;
  name: string;
  meeting_count: number;
  status?: string;
  created_at: string;
}

export interface UnlinkedSpeakerPromptsResponse {
  unlinked_speakers: UnlinkedSpeakerPrompt[];
}

export interface KnownSpeakersResponse {
  known_speakers: KnownSpeaker[];
}

export interface CreateKnownSpeakerRequest {
  name: string;
  source_speaker_mapping_id: number;
}

export interface UpdateKnownSpeakerRequest {
  name: string;
}

// ─── Team Types ──────────────────────────────────────────────────────────────

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  member_count: number;
  your_role: TeamRole;
  created_at: string;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
}

export interface TeamMember {
  user_id: string;
  name: string;
  email: string;
  role: TeamRole;
  joined_at: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  created_at: string;
  expires_at: string;
  is_registered: boolean;
}

export interface CreateTeamRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: TeamRole;
}

export interface TeamListResponse {
  teams: Team[];
}

// Voice Identity
export interface VoiceIdentityResponse {
  status: 'pending' | 'ready' | 'error' | 'not_registered';
  updated_at?: string;
}

// Notifications
export interface NotificationResponse {
  id: number;
  meeting_id?: string;
  type: 'mention' | 'summary' | 'conflict' | 'action_item';
  title: string;
  message: string;
  extra_data: {
    absent?: boolean;
    project_id?: string;
    [key: string]: any;
  };
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  notify_on_mention: boolean;
  notify_on_summary: boolean;
  email_on_mention: boolean;
  [key: string]: any;
}
