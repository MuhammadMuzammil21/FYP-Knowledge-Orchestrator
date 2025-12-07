/**
 * Chat Message Types
 * Type definitions for RAG chat interface
 */

export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: Array<{ chunk: string; score: number }>;
}
