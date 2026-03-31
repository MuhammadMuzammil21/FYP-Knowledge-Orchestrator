/**
 * Audio constraints and MIME type utilities for meeting recording.
 * Optimized for multi-speaker capture — all AEC/NS/AGC disabled intentionally.
 * Disabling echoCancellation/noiseSuppression prevents the browser's VAD
 * (voice activity detection) from cutting off secondary speakers and
 * overlapping voices. The backend ASR handles cleanup instead.
 */

export const MEETING_RECORDING_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    channelCount: { ideal: 2, min: 1 },
    sampleRate: { ideal: 48000, min: 44100 },
    sampleSize: { ideal: 24, min: 16 },
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
  video: false,
};

/**
 * Fallback for browsers/devices that reject the full constraint set.
 * Still disables the three processing flags that harm multi-speaker capture.
 */
export const FALLBACK_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
  video: false,
};

/**
 * Ordered MIME type preference list for MediaRecorder.
 * We prefer PCM-in-WebM (lossless) then fall back to compressed formats.
 * All are decoded to raw PCM before WAV encoding anyway.
 */
export const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=pcm',   // Chrome 94+ — raw PCM, best quality
  'audio/webm;codecs=opus',  // Chrome/Edge — Opus compression
  'audio/ogg;codecs=opus',   // Firefox — Opus in OGG
  'audio/mp4',               // Safari
  'audio/webm',              // Generic fallback
] as const;

export function getSupportedMimeType(): string {
  return (
    PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ??
    ''
  );
}
