import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebcam } from './useWebcam';

// Mock for HTMLVideoElement with proper typing
class MockVideoElement {
  srcObject: MediaStream | null = null;
  onloadedmetadata: (() => void) | null = null;
  onloadeddata: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  videoWidth = 640;
  videoHeight = 480;

  play = vi.fn().mockResolvedValue(undefined);
}

// Mock for MediaStream
class MockMediaStream {
  constructor() {
    this.tracks = [{ stop: vi.fn() } as unknown as MediaStreamTrack, { stop: vi.fn() } as unknown as MediaStreamTrack];
  }

  tracks: MediaStreamTrack[];

  getTracks() {
    return this.tracks;
  }
}

// Setup global mocks
const mockGetUserMedia = vi.fn();
const mockMediaDevices = { getUserMedia: mockGetUserMedia };

describe('useWebcam', () => {
  // Setup mocks before tests
  beforeEach(() => {
    // Mock navigator.mediaDevices
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      writable: true,
      value: mockMediaDevices,
    });

    // Create a stub for HTMLVideoElement
    vi.spyOn(HTMLVideoElement.prototype, 'play').mockImplementation(() => Promise.resolve());

    // Mock successful media stream - default to success
    const mockVideoEl = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockVideoEl);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWebcam());

    expect(result.current.videoRef).toBeDefined();
    expect(result.current.stream).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.startCamera).toBe('function');
    expect(typeof result.current.stopCamera).toBe('function');
  });

  it('should start camera when startCamera is called', async () => {
    const onCaptureReady = vi.fn();
    const onStreamAvailable = vi.fn();

    const mockMediaStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => useWebcam({ onCaptureReady, onStreamAvailable }));

    // Mock the video element ref
    const mockVideo = new MockVideoElement();
    result.current.videoRef.current = mockVideo as unknown as HTMLVideoElement;

    await act(async () => {
      await result.current.startCamera();
    });

    // Simulate video loaded event to trigger the play
    await act(async () => {
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata();
      }
    });

    // Verify state updates
    expect(result.current.stream).toBe(mockMediaStream);
    expect(onStreamAvailable).toHaveBeenCalledWith(mockMediaStream);
    expect(mockVideo.play).toHaveBeenCalled();
    expect(result.current.isActive).toBe(true);
    expect(onCaptureReady).toHaveBeenCalled();
  });

  it('should set error if getUserMedia throws an exception', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useWebcam());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(result.current.stream).toBeNull();
  });

  it('should stop camera when stopCamera is called', async () => {
    const mockMediaStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => useWebcam());

    // Mock the video element ref
    const mockVideo = new MockVideoElement();
    result.current.videoRef.current = mockVideo as unknown as HTMLVideoElement;

    // Start camera
    await act(async () => {
      await result.current.startCamera();

      // Simulate video loaded event
      if (mockVideo.onloadedmetadata) mockVideo.onloadedmetadata();
    });

    expect(result.current.stream).toBe(mockMediaStream);

    // Stop camera
    act(() => {
      result.current.stopCamera();
    });

    // Check that tracks were stopped
    expect(mockMediaStream.tracks[0].stop).toHaveBeenCalled();
    expect(mockMediaStream.tracks[1].stop).toHaveBeenCalled();
    expect(result.current.stream).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(mockVideo.srcObject).toBeNull();
  });

  it('should handle the case when video ref is not available', async () => {
    const onCaptureReady = vi.fn();
    const onStreamAvailable = vi.fn();

    const mockMediaStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => useWebcam({ onCaptureReady, onStreamAvailable }));

    // Ensure videoRef.current is null
    result.current.videoRef.current = null;

    await act(async () => {
      await result.current.startCamera();
    });

    // onStreamAvailable should still be called since stream is created
    expect(onStreamAvailable).toHaveBeenCalledWith(mockMediaStream);
    // onCaptureReady should not have been called since video element wasn't available
    expect(onCaptureReady).not.toHaveBeenCalled();
    // Stream should still be set
    expect(result.current.stream).toBe(mockMediaStream);
    // isActive should be false since video couldn't be played
    expect(result.current.isActive).toBe(false);
  });

  it('should clean up on unmount', async () => {
    const mockMediaStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(mockMediaStream);

    const { result, unmount } = renderHook(() => useWebcam());

    // Start camera first
    await act(async () => {
      await result.current.startCamera();
    });

    // Unmount the component
    unmount();

    // Verify that tracks were stopped during cleanup
    expect(mockMediaStream.tracks[0].stop).toHaveBeenCalled();
    expect(mockMediaStream.tracks[1].stop).toHaveBeenCalled();
  });

  it('should handle browser not supporting getUserMedia', async () => {
    // Mock navigator.mediaDevices to be undefined
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useWebcam());
    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain('Unable to access camera');
  });

  it('should handle play error', async () => {
    const onCaptureReady = vi.fn();
    const mockMediaStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => useWebcam({ onCaptureReady }));

    // Mock the video element ref
    const mockVideo = new MockVideoElement();
    // Mock play to reject
    mockVideo.play.mockRejectedValueOnce(new Error('Play failed'));

    result.current.videoRef.current = mockVideo as unknown as HTMLVideoElement;

    await act(async () => {
      await result.current.startCamera();
    });

    // Simulate video loaded event that will trigger play (which will fail)
    await act(async () => {
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata();
      }
    });

    // Should have set the stream
    expect(result.current.stream).toBe(mockMediaStream);
    // onCaptureReady should not have been called due to play error
    expect(onCaptureReady).not.toHaveBeenCalled();
    // isActive should be false since play failed
    expect(result.current.isActive).toBe(false);
  });
});
