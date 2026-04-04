/**
 * Audio conversion utilities.
 *
 * convertBlobToWav: Decodes any browser-recorded audio blob (WebM, OGG, MP4)
 * using the Web Audio API's hardware-accelerated decoder, then re-encodes as
 * 16-bit PCM WAV. WAV is lossless and universally accepted by ASR pipelines.
 *
 * The intermediate AudioBuffer operates entirely in memory; no DOM or
 * network access is needed.
 */

export async function convertBlobToWav(
  blob: Blob,
  filename: string = 'recording.wav'
): Promise<File> {
  const arrayBuffer = await blob.arrayBuffer();

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 48000,
  });

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    // Always release the AudioContext regardless of decode success/failure
    await audioContext.close();
  }

  const wavArrayBuffer = audioBufferToWav(audioBuffer);
  return new File([wavArrayBuffer], filename, { type: 'audio/wav' });
}

/**
 * Encodes an AudioBuffer as a standard 16-bit PCM WAV ArrayBuffer.
 * Handles both mono and stereo; channels are interleaved per the WAV spec.
 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const totalSize = 44 + dataSize; // 44-byte RIFF/WAV header

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM samples — interleave channels
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const channelData = buffer.getChannelData(ch);
      // Clamp float32 [-1.0, 1.0] → int16 [-32768, 32767]
      const clamped = Math.max(-1, Math.min(1, channelData[i]));
      const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Formats a duration in seconds as MM:SS or H:MM:SS.
 */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Estimates the output WAV file size in MB for a given duration.
 * Formula: duration × sampleRate × channels × 2 bytes (16-bit)
 */
export function estimateWavSizeMB(
  durationSeconds: number,
  channels = 2,
  sampleRate = 48000
): number {
  return (durationSeconds * sampleRate * channels * 2) / (1024 * 1024);
}
