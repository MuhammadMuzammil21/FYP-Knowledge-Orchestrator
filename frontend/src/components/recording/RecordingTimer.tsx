/**
 * RecordingTimer — displays elapsed recording time with a blinking
 * red dot indicator while actively recording.
 */

import { formatDuration } from '@/lib/audio/audioConverter';

interface RecordingTimerProps {
  seconds: number;
  isRecording: boolean;
}

export function RecordingTimer({ seconds, isRecording }: RecordingTimerProps) {
  return (
    <div className="flex items-center gap-2 min-w-[72px]">
      {isRecording && (
        <span
          className="h-2 w-2 rounded-full bg-destructive animate-pulse flex-shrink-0"
          aria-label="Recording in progress"
        />
      )}
      <span
        className="font-mono text-sm font-semibold tabular-nums text-foreground"
        aria-live="off"
      >
        {formatDuration(seconds)}
      </span>
    </div>
  );
}
