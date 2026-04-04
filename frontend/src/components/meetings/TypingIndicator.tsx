/**
 * TypingIndicator Component
 * Shows animated dots while AI is generating response
 */
export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">🤖 AI Assistant</span>
        </div>
        <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4 border border-border">
          <div className="flex gap-1.5">
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1s' }}
            />
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '1s' }}
            />
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '1s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
