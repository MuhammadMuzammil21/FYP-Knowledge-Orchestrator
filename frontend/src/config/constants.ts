export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'AI Meeting Orchestrator',
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600'), // 100MB
  allowedFileTypes: ['.mp3', '.wav', '.m4a', '.ogg'],
  allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'],
};

export const ROUTES = {
  home: '/',
  meeting: (id: string) => `/meetings/${id}`,
  upload: '/upload',
} as const;

export const QUERY_KEYS = {
  meetings: ['meetings'],
  meeting: (id: string) => ['meeting', id],
  transcript: (id: string) => ['transcript', id],
  entities: (id: string) => ['entities', id],
  search: (id: string, query: string) => ['search', id, query],
} as const;

export const STATUS = {
  processing: 'processing',
  complete: 'complete',
  failed: 'failed',
} as const;

export const SPEAKER_COLORS = [
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#eb2f96',
  '#722ed1',
  '#13c2c2',
] as const;