/**
 * VoiceRecorder — the full recording panel that renders into the dashboard form.
 *
 * State machine rendering:
 *   idle       → "click to grant mic access" empty state
 *   requesting → spinner
 *   ready      → waveform canvas + Record button
 *   recording  → live waveform + timer + Pause + Stop + Discard
 *   paused     → frozen waveform + timer + Resume + Stop + Discard
 *   converting → conversion spinner
 *   done       → file info row (same visual style as file upload done state)
 *   error      → error message + retry button
 *
 * On `done`, fires `onRecordingComplete(wavFile)` — the caller sets this as
 * the upload file. On discard at any stage, fires `onDiscard()`.
 */

'use client';

import { useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { AudioWaveform } from './AudioWaveform';
import { RecordingTimer } from './RecordingTimer';
import {
  estimateWavSizeMB,
  formatDuration,
} from '@/lib/audio/audioConverter';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  /** Called when the recording has been successfully converted to a WAV File. */
  onRecordingComplete: (file: File) => void;
  /** Called when the user explicitly discards a recording or resets the component. */
  onDiscard: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  onDiscard,
  disabled = false,
}: VoiceRecorderProps) {
  const recorder = useVoiceRecorder();
  const isLive = recorder.state === 'recording';
  const estimatedMB = estimateWavSizeMB(recorder.durationSeconds);
  const isNearSizeLimit = estimatedMB > 90;

  // Fire the parent callback once conversion is complete
  useEffect(() => {
    if (recorder.state === 'done' && recorder.audioFile) {
      onRecordingComplete(recorder.audioFile);
    }
  }, [recorder.state, recorder.audioFile, onRecordingComplete]);

  const handleDiscard = () => {
    recorder.discardRecording();
    onDiscard();
  };

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (recorder.state === 'idle') {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => recorder.requestPermission()}
        className={cn(
          'w-full relative flex flex-col items-center justify-center gap-3',
          'rounded-xl border-2 border-dashed border-border min-h-[140px]',
          'text-center transition-all duration-200',
          !disabled &&
            'cursor-pointer hover:border-destructive/50 hover:bg-destructive/[0.02]',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        <div
          className={cn(
            'h-11 w-11 rounded-full flex items-center justify-center transition-colors',
            'bg-destructive/10'
          )}
        >
          <Mic className="h-5 w-5 text-destructive/70" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Record your meeting live
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click to grant microphone access
          </p>
        </div>
      </button>
    );
  }

  // ── REQUESTING PERMISSION ─────────────────────────────────────────────────
  if (recorder.state === 'requesting') {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 min-h-[140px]">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Waiting for microphone access…
        </span>
      </div>
    );
  }

  // ── CONVERTING BLOB → WAV ─────────────────────────────────────────────────
  if (recorder.state === 'converting' || recorder.state === 'stopped') {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 min-h-[140px]">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          Converting to WAV — please wait…
        </span>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (recorder.state === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/40 bg-destructive/5 min-h-[140px] px-6 py-6 text-center">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-destructive leading-relaxed max-w-sm">
          {recorder.error}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDiscard}
        >
          Try again
        </Button>
      </div>
    );
  }

  // ── DONE — shows file info row matching upload done state ─────────────────
  if (recorder.state === 'done' && recorder.audioFile) {
    const sizeMB = (recorder.audioFile.size / 1024 / 1024).toFixed(2);
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-muted/30">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {recorder.audioFile.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDuration(recorder.durationSeconds)} &middot; {sizeMB} MB
            &middot; WAV
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleDiscard}
          title="Discard recording and record again"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  // ── READY / RECORDING / PAUSED — main recorder UI ─────────────────────────
  return (
    <div
      className={cn(
        'rounded-xl border-2 overflow-hidden transition-colors duration-300',
        isLive ? 'border-destructive/50' : 'border-border'
      )}
    >
      {/* Waveform canvas area */}
      <div className="relative h-20 bg-muted/20">
        <AudioWaveform
          analyserNode={recorder.analyserNode}
          isActive={isLive}
          className="absolute inset-0"
        />

        {/* Overlay text when not actively drawing */}
        {recorder.state === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">
              Microphone ready — press Record to start
            </p>
          </div>
        )}
        {recorder.state === 'paused' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground italic">
              Recording paused
            </p>
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-3 flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5">
            <Radio className="h-2.5 w-2.5 text-destructive" />
            <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
        {/* Timer */}
        <RecordingTimer
          seconds={recorder.durationSeconds}
          isRecording={isLive}
        />

        {/* Size warning — shown when approaching 100MB limit */}
        {isNearSizeLimit && (
          <span className="text-[11px] text-destructive font-medium ml-1">
            ~{estimatedMB.toFixed(0)} MB — nearing 100MB limit
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Discard button — always visible once past idle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={handleDiscard}
          title="Discard and start over"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        {/* Pause (while recording) */}
        {isLive && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={recorder.pauseRecording}
            title="Pause recording"
          >
            <Pause className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Resume (while paused) */}
        {recorder.state === 'paused' && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={recorder.resumeRecording}
            title="Resume recording"
          >
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Start recording button (ready state only) */}
        {recorder.state === 'ready' && (
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-shrink-0"
            onClick={recorder.startRecording}
            disabled={disabled}
          >
            <Mic className="h-3.5 w-3.5" />
            Record
          </Button>
        )}

        {/* Stop button (recording or paused) */}
        {(isLive || recorder.state === 'paused') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 flex-shrink-0"
            onClick={recorder.stopRecording}
          >
            <Square className="h-3.5 w-3.5" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
