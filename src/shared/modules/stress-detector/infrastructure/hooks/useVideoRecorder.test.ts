import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoRecorder } from './useVideoRecorder';
import { videoRecorder } from '../services/VideoRecorder';
import type { RecordingResult } from '../types/VideoRecorder.types';

// Mock the VideoRecorder service
vi.mock('../services/VideoRecorder', () => {
  return {
    videoRecorder: {
      setup: vi.fn(),
      startRecording: vi.fn(),
      cleanup: vi.fn(),
    },
  };
});

describe('useVideoRecorder', () => {
  // Sample mock values - simplify the mock
  const mockStream = {} as MediaStream;

  // Mock the getVideoTracks method directly on the mock
  mockStream.getVideoTracks = vi.fn().mockReturnValue([{ id: 'track1' }]);

  const mockRecordingResult: RecordingResult = {
    blob: new Blob(['test'], { type: 'video/webm' }),
    url: 'blob:mock-url',
    duration: 3000,
  };

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();

    // Mock time-related functions
    vi.useFakeTimers();

    // Setup default mock implementations
    vi.mocked(videoRecorder.setup).mockImplementation(() => {});
    vi.mocked(videoRecorder.startRecording).mockResolvedValue(mockRecordingResult);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useVideoRecorder({}));

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.countdown).toBeNull();
    expect(result.current.recordingTime).toBeNull();
    expect(result.current.cameraReady).toBe(false);
    expect(result.current.hasRecorded).toBe(false);
    expect(typeof result.current.setupRecorder).toBe('function');
    expect(typeof result.current.startRecordingWithCountdown).toBe('function');
    expect(typeof result.current.resetRecording).toBe('function');
  });

  it('should not set up recorder with an invalid stream', () => {
    const { result } = renderHook(() => useVideoRecorder({}));
    const invalidStream = { getVideoTracks: vi.fn().mockReturnValue([]) } as unknown as MediaStream;

    // Mock console.error to prevent it from displaying during test
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.setupRecorder(invalidStream);
    });

    expect(videoRecorder.setup).not.toHaveBeenCalled();
    expect(result.current.cameraReady).toBe(false);
    expect(consoleErrorMock).toHaveBeenCalledWith('Invalid media stream: No video tracks found');

    consoleErrorMock.mockRestore();
  });

  it('should handle setup errors gracefully', () => {
    const { result } = renderHook(() => useVideoRecorder({}));

    // Mock setup to throw an error
    const setupError = new Error('Setup error');
    vi.spyOn(videoRecorder, 'setup').mockImplementationOnce(() => {
      throw setupError;
    });

    // Mock console.error to prevent it from displaying during test
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.setupRecorder(mockStream);
    });

    expect(result.current.cameraReady).toBe(false);
    // Different check for error logging
    expect(consoleErrorMock).toHaveBeenCalled();
    expect(consoleErrorMock.mock.calls[0][0]).toBe('Failed to setup video recorder:');

    consoleErrorMock.mockRestore();
  });

  it('should not start recording if camera is not ready', async () => {
    const { result } = renderHook(() => useVideoRecorder({}));

    // Mock console.error
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await result.current.startRecordingWithCountdown();
    });

    expect(result.current.isRecording).toBe(false);
    expect(videoRecorder.startRecording).not.toHaveBeenCalled();
    expect(consoleErrorMock).toHaveBeenCalledWith('Camera is not ready. Please ensure camera access is granted.');

    consoleErrorMock.mockRestore();
  });
});
