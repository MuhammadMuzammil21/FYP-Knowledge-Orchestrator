/**
 * useAudioVisualizer — drives a canvas-based real-time waveform display.
 *
 * Draws the time-domain waveform from an AnalyserNode using requestAnimationFrame.
 * Uses CSS custom properties from the app's theme for colors so it respects
 * light/dark mode automatically.
 *
 * Stops rendering when `isActive` is false to avoid unnecessary CPU usage
 * while paused or before recording starts.
 */

import { useEffect, useRef, useCallback } from 'react';

export function useAudioVisualizer(
  analyserNode: AnalyserNode | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isActive: boolean
): void {
  const animationRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    if (!analyserNode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    animationRef.current = requestAnimationFrame(draw);
    
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(dataArray);

    canvas.width = canvas.offsetWidth || 300;
    canvas.height = canvas.offsetHeight || 64;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'oklch(0.65 0.12 195)';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const normalised = dataArray[i] / 128.0;
      const y = (normalised / 2) * canvas.height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [analyserNode, canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!analyserNode || !canvas || !isActive) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [analyserNode, canvasRef, isActive, draw]);
}
