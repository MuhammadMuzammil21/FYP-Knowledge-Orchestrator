/**
 * AudioWaveform — canvas element that renders a live waveform.
 * Thin wrapper around useAudioVisualizer; the canvas itself is unstyled
 * so the parent component controls dimensions via className.
 */

'use client';

import { useRef } from 'react';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';

interface AudioWaveformProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  className?: string;
}

export function AudioWaveform({ analyserNode, isActive, className }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useAudioVisualizer(analyserNode, canvasRef as React.RefObject<HTMLCanvasElement>, isActive);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
      role="img"
      aria-label="Audio waveform visualisation"
    />
  );
}
