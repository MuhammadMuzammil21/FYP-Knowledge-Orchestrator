'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Loader2,
  AudioWaveform,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AudioPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(function AudioPlayer(
  { src, onTimeUpdate, className },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expose seekTo handle to parent
  useImperativeHandle(ref, () => ({
    seekTo(seconds: number) {
      const ws = wavesurferRef.current;
      if (ws && isReady && duration > 0) {
        ws.seekTo(Math.max(0, Math.min(seconds / duration, 1)));
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current || !src) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'oklch(0.88 0.05 150 / 0.35)',
      progressColor: 'oklch(0.65 0.12 195)',
      cursorColor: 'oklch(0.65 0.12 195)',
      barWidth: 2,
      barRadius: 2,
      barGap: 1,
      height: 56,
      normalize: true,
      interact: true,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setIsLoading(false);
      setIsReady(true);
      setDuration(ws.getDuration());
      ws.setVolume(volume);
    });

    ws.on('audioprocess', (t) => {
      setCurrentTime(t);
      onTimeUpdate?.(t);
    });

    ws.on('seeking', (t) => {
      setCurrentTime(t * ws.getDuration());
      onTimeUpdate?.(t * ws.getDuration());
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    const handleError = (e: Error) => {
      if (e.name === 'AbortError') return;
      setError('Could not load audio.');
      setIsLoading(false);
      console.error('WaveSurfer error:', e);
    };

    ws.on('error', handleError);

    ws.load(src);

    return () => {
      ws.un('error', handleError);
      ws.un('ready', () => {});
      ws.un('audioprocess', () => {});
      
      try {
        if (ws.isPlaying()) {
          ws.pause();
        }
        ws.destroy();
      } catch (err) {
        console.warn('Wavesurfer destroy error (safe to ignore):', err);
      }
      wavesurferRef.current = null;
      setIsReady(false);
      setIsLoading(true);
      setIsPlaying(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const ws = wavesurferRef.current;
      if (ws && isReady) ws.skip(delta);
    },
    [isReady]
  );

  const handleVolumeChange = useCallback((val: number[]) => {
    const v = val[0];
    setVolume(v);
    setIsMuted(v === 0);
    wavesurferRef.current?.setVolume(v);
  }, []);

  const toggleMute = useCallback(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    if (isMuted) {
      ws.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      ws.setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  if (error) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border bg-card p-4 flex items-center gap-3',
          className
        )}
      >
        <AudioWaveform className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      {/* Waveform */}
      <div className="relative px-4 pt-3 pb-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading audio…
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Controls */}
      <div className="px-4 pb-3 flex items-center gap-3">
        {/* Skip back */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => skip(-10)}
          disabled={!isReady}
          title="Back 10s"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          size="icon"
          className="h-9 w-9 rounded-full shadow-sm flex-shrink-0"
          onClick={togglePlay}
          disabled={!isReady}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
        </Button>

        {/* Skip forward */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => skip(10)}
          disabled={!isReady}
          title="Forward 10s"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        {/* Time display */}
        <span className="text-xs tabular-nums text-muted-foreground min-w-[80px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Volume */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>
          <div className="w-20 hidden sm:block">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
              className="w-full h-1 accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
