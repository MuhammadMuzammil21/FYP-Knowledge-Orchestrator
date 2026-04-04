import { renderHook, act } from '@testing-library/react'
import { useVoiceRecorder } from '../useVoiceRecorder'
import { convertBlobToWav } from '@/lib/audio/audioConverter'

// 1. Mock the audio converter
jest.mock('@/lib/audio/audioConverter', () => ({
  convertBlobToWav: jest.fn(),
}))

// 2. Mock browser APIs
const mockStream = {
  getTracks: () => [{ stop: jest.fn() }],
}

const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  state: 'inactive',
  ondataavailable: null as any,
  onstop: null as any,
  onerror: null as any,
}

describe('useVoiceRecorder hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue(mockStream),
      },
      writable: true,
    });

    // Mock MediaRecorder
    global.MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder) as any;
    (global.MediaRecorder as any).isTypeSupported = jest.fn().mockReturnValue(true);

    // Mock AudioContext
    const mockAudioContext = {
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      createAnalyser: jest.fn().mockReturnValue({
        fftSize: 0,
        smoothingTimeConstant: 0.8,
        connect: jest.fn(),
      }),
      close: jest.fn().mockResolvedValue(undefined),
    };
    (global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
  })

  it('initializes in idle state', () => {
    const { result } = renderHook(() => useVoiceRecorder())
    expect(result.current.state).toBe('idle')
    expect(result.current.durationSeconds).toBe(0)
  })

  it('transitions to ready after requesting permission', async () => {
    const { result } = renderHook(() => useVoiceRecorder())

    await act(async () => {
      await result.current.requestPermission()
    })

    expect(result.current.state).toBe('ready')
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
  })

  it('transitions to recording', async () => {
    const { result } = renderHook(() => useVoiceRecorder())

    // Must be ready first
    await act(async () => {
      await result.current.requestPermission()
    })

    act(() => {
      result.current.startRecording()
    })

    expect(result.current.state).toBe('recording')
    expect(global.MediaRecorder).toHaveBeenCalled()
  })

  it('handles pause and resume', async () => {
    const { result } = renderHook(() => useVoiceRecorder())

    await act(async () => {
      await result.current.requestPermission()
    })

    act(() => {
      result.current.startRecording()
    })

    // Simulate recorder state change for logic check
    mockMediaRecorder.state = 'recording'
    
    act(() => {
      result.current.pauseRecording()
    })
    expect(result.current.state).toBe('paused')

    mockMediaRecorder.state = 'paused'
    act(() => {
      result.current.resumeRecording()
    })
    expect(result.current.state).toBe('recording')
  })

  it('transitions to done after stopping and converting', async () => {
    const mockFile = new File([''], 'test.wav', { type: 'audio/wav' });
    (convertBlobToWav as jest.Mock).mockResolvedValue(mockFile);

    const { result } = renderHook(() => useVoiceRecorder())

    await act(async () => {
      await result.current.requestPermission()
    })

    act(() => {
      result.current.startRecording()
    })

    act(() => {
      result.current.stopRecording()
    })

    // Manually trigger the recorder's onstop callback
    await act(async () => {
      if (mockMediaRecorder.onstop) {
        await mockMediaRecorder.onstop()
      }
    })

    expect(result.current.state).toBe('done')
    expect(result.current.audioFile).toBe(mockFile)
  })

  it('handles discard', async () => {
    const { result } = renderHook(() => useVoiceRecorder())

    await act(async () => {
      await result.current.requestPermission()
    })

    act(() => {
      result.current.startRecording()
    })

    act(() => {
      result.current.discardRecording()
    })

    expect(result.current.state).toBe('idle')
    expect(result.current.durationSeconds).toBe(0)
  })
})
