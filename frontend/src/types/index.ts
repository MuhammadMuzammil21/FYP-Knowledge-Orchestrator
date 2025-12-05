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
    type: string;
    description: string;
    severity: string;
    related_meeting_id?: string;
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
