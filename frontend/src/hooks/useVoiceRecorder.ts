/**
 * useVoiceRecorder — state machine for browser-based meeting audio capture.
 *
 * State transitions:
 *   idle → requesting → ready → recording ⇄ paused → stopped → converting → done
 *                                                                           → error
 *
 * The hook is self-contained and has no dependencies on other application
 * state. The caller receives a `audioFile: File | null` in the `done` state
 * which is a standard WAV file ready for the existing upload pipeline.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MEETING_RECORDING_CONSTRAINTS,
  FALLBACK_CONSTRAINTS,
  getSupportedMimeType,
} from '@/lib/audio/audioConstraints';
import { convertBlobToWav } from '@/lib/audio/audioConverter';

export type RecordingState =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'converting'
  | 'done'
  | 'error';

export interface UseVoiceRecorderReturn {
  state: RecordingState;
  durationSeconds: number;
  audioFile: File | null;
  error: string | null;
  stream: MediaStream | null;
  analyserNode: AnalyserNode | null;
  requestPermission: () => Promise<void>;
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  discardRecording: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep streamRef in sync for use in callbacks without stale closure issues
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  // Cleanup on unmount — release microphone and timers
  useEffect(() => {
    return () => {
      clearTimer();
      releaseResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseResources = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close().catch(() => null);
    audioContextRef.current = null;
  };

  const requestPermission = useCallback(async () => {
    setState('requesting');
    setError(null);

    let mediaStream: MediaStream;

    try {
      // Attempt high-quality multi-speaker constraints first
      mediaStream = await navigator.mediaDevices.getUserMedia(MEETING_RECORDING_CONSTRAINTS);
    } catch {
      try {
        // Fallback: minimal constraints, still with processing disabled
        mediaStream = await navigator.mediaDevices.getUserMedia(FALLBACK_CONSTRAINTS);
      } catch (err: any) {
        let message = `Could not access microphone: ${err.message}`;
        if (err.name === 'NotAllowedError') {
          message =
            'Microphone access was denied. Please allow microphone access in your browser settings and try again.';
        } else if (err.name === 'NotFoundError') {
          message = 'No microphone found. Please connect a microphone and try again.';
        } else if (err.name === 'NotReadableError') {
          message =
            'Microphone is in use by another application. Please close other apps using the microphone.';
        }
        setError(message);
        setState('error');
        return;
      }
    }

    // Set up Web Audio API analyser for waveform visualization.
    // We create a MediaStreamSource → AnalyserNode chain but deliberately
    // do NOT connect to audioCtx.destination to avoid speaker playback.
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      // analyser intentionally NOT connected to destination

      audioContextRef.current = audioCtx;
      setAnalyserNode(analyser);
    } catch {
      // Visualization failure is non-fatal — recording can continue without it
      setAnalyserNode(null);
    }

    setStream(mediaStream);
    setState('ready');
  }, []);

  const startRecording = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) return;

    chunksRef.current = [];
    const mimeType = getSupportedMimeType();

    const recorderOptions: MediaRecorderOptions = {
      audioBitsPerSecond: 256000,
    };
    if (mimeType) recorderOptions.mimeType = mimeType;

    const recorder = new MediaRecorder(currentStream, recorderOptions);

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      // Transition to converting immediately so the UI shows a spinner
      setState('converting');

      const rawBlob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });

      try {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .replace('T', '_')
          .substring(0, 19);
        const wavFile = await convertBlobToWav(rawBlob, `meeting-recording_${timestamp}.wav`);
        setAudioFile(wavFile);
        setState('done');
      } catch (err: any) {
        setError(
          `Failed to convert recording to WAV: ${err.message}. ` +
            `Try recording again or upload a file instead.`
        );
        setState('error');
      }
    };

    recorder.onerror = (e: any) => {
      clearTimer();
      setError(`Recording error: ${e.error?.message ?? 'Unknown error'}`);
      setState('error');
    };

    // Collect in 1-second chunks — bounds memory usage for long recordings
    // and provides resilience if the tab is backgrounded
    recorder.start(1000);
    recorderRef.current = recorder;

    setDurationSeconds(0);
    timerRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);

    setState('recording');
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
      clearTimer();
      setState('paused');
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
      setState('recording');
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearTimer();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    releaseResources();
    setStream(null);
    setAnalyserNode(null);
    // State transitions to 'converting' inside recorder.onstop
  }, []);

  const discardRecording = useCallback(() => {
    clearTimer();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      // Suppress onstop handler by replacing it before calling stop
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    releaseResources();
    chunksRef.current = [];
    recorderRef.current = null;
    setAudioFile(null);
    setDurationSeconds(0);
    setError(null);
    setStream(null);
    setAnalyserNode(null);
    setState('idle');
  }, []);

  return {
    state,
    durationSeconds,
    audioFile,
    error,
    stream,
    analyserNode,
    requestPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    discardRecording,
  };
}
