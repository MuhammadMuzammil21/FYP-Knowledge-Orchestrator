// Meeting Types
export interface Meeting {
  id: string;
  title: string;
  uploadDate: string;
  duration: number;
  status: 'processing' | 'complete' | 'failed';
  speakerCount: number;
  audioUrl: string;
}

export interface MeetingDetail extends Meeting {
  transcript: TranscriptSegment[];
  entities: Entities;
}

// Transcript Types
export interface TranscriptSegment {
  speaker: string;
  timestamp: number;
  text: string;
}

export interface SearchResult {
  segmentIndex: number;
  speaker: string;
  timestamp: number;
  text: string;
}

// Entity Types
export interface Task {
  id: string;
  description: string;
  owner: string;
  deadline: string | null;
  status: 'pending' | 'complete';
  timestamp: number;
}

export interface Decision {
  id: string;
  statement: string;
  decidedBy: string;
  timestamp: number;
}

export interface Entities {
  tasks: Task[];
  decisions: Decision[];
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface MeetingsResponse {
  meetings: Meeting[];
}

export interface TranscriptResponse {
  meetingId: string;
  segments: TranscriptSegment[];
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
}

export interface UploadResponse {
  meeting_id: string;
  status: string;
  message: string;
}

// Processing Status Types
export type ProcessingStage = 'uploading' | 'transcribing' | 'extracting' | 'complete' | 'failed';

export interface ProcessingStageInfo {
  completed: boolean;
  current: boolean;
  progress?: number; // 0-100 for individual stage progress
}

export interface ProcessingStatus {
  meeting_id: string;
  status: 'processing' | 'complete' | 'failed';
  stage: ProcessingStage;
  progress: number; // Overall progress 0-100
  stage_progress?: {
    uploading: number;
    transcribing: number;
    extracting: number;
    complete: number;
  };
  stages: {
    uploading: ProcessingStageInfo;
    transcribing: ProcessingStageInfo;
    extracting: ProcessingStageInfo;
    complete: ProcessingStageInfo;
  };
}

// Component Props Types
export interface UploadFormProps {
  onUploadSuccess?: (meetingId: string) => void;
}

export interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  searchQuery?: string;
  onTimestampClick?: (timestamp: number) => void;
}

export interface EntityPanelProps {
  entities: Entities;
  onTimestampClick?: (timestamp: number) => void;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  resultCount: number;
  onNavigate?: (index: number) => void;
}