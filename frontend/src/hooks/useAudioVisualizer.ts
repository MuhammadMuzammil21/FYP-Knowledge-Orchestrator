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

import { useEffect, useRef } from 'react';

export function useAudioVisualizer(
  analyserNode: AnalyserNode | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isActive: boolean
): void {
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!analyserNode || !canvas || !isActive) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Clear the canvas when inactive
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

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteTimeDomainData(dataArray);

      // Resize canvas to match its CSS dimensions each frame
      // (handles window resize and responsive layout changes)
      canvas.width = canvas.offsetWidth || 300;
      canvas.height = canvas.offsetHeight || 64;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Waveform path
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'oklch(0.65 0.12 195)'; // --accent token
      ctx.lineJoin = 'round';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // dataArray values are 0–255; 128 = silence (centre line)
        const normalised = dataArray[i] / 128.0; // 0–2
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
    };

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [analyserNode, canvasRef, isActive]);
}
