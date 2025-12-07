import { MessageResponse } from './MessageResponse';

interface AssistantMessageProps {
    content: string;
    timestamp: Date;
    context?: Array<{ chunk: string; score: number }>;
}

/**
 * AssistantMessage Component
 * Displays AI assistant's response with markdown and context
 */
export function AssistantMessage({ content, timestamp, context }: AssistantMessageProps) {
    return (
        <div className="flex justify-start mb-4">
            <div className="max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">🤖 AI Assistant</span>
                    <span className="text-xs text-gray-500">
                        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <MessageResponse
                    answer={content}
                    context={context}
                    showThinking={false}
                />
            </div>
        </div>
    );
}
