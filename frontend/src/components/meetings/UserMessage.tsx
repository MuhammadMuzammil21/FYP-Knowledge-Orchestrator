import { Card } from '@/components/ui/card';

interface UserMessageProps {
    content: string;
    timestamp: Date;
}

/**
 * UserMessage Component
 * Displays user's question in chat-style bubble
 */
export function UserMessage({ content, timestamp }: UserMessageProps) {
    return (
        <div className="flex justify-end mb-4">
            <div className="max-w-[80%]">
                <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="text-xs text-gray-500">
                        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm font-medium text-gray-700">You</span>
                </div>
                <Card className="bg-blue-600 text-white rounded-2xl rounded-tr-sm border-blue-600">
                    <div className="px-4 py-3">
                        <p className="text-sm leading-relaxed">{content}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
