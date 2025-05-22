/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { useCanvasRenderer } from './useCanvasRenderer';

// We need to fully mock React's useRef
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useRef: vi.fn(),
  };
});

describe('useCanvasRenderer', () => {
  // Mock canvas context methods
  const mockCtx = {
    save: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  // Mock canvas element
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue(mockCtx),
  } as unknown as HTMLCanvasElement;

  // Mock video element
  const mockVideo = {
    readyState: 2, // HAVE_CURRENT_DATA
    videoWidth: 640,
    videoHeight: 480,
  } as unknown as HTMLVideoElement;

  // Mock refs
  const mockCanvasRef = { current: mockCanvas };
  const mockVideoRef = { current: mockVideo };
  const mockStream = {} as MediaStream;

  // Store original window methods
  const originalRAF = window.requestAnimationFrame;
  const originalCAF = window.cancelAnimationFrame;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock requestAnimationFrame and cancelAnimationFrame
    window.requestAnimationFrame = vi.fn().mockReturnValue(123);
    window.cancelAnimationFrame = vi.fn();

    // Set up React.useRef mock implementation
    vi.mocked(React.useRef).mockReturnValue(mockCanvasRef);
  });

  afterEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Restore original window methods
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
  });

  it('should return canvas ref and clearCanvas function', () => {
    const { result } = renderHook(() =>
      useCanvasRenderer({
        videoRef: mockVideoRef,
        stream: mockStream,
        isActive: true,
      }),
    );

    // Verify hook returns expected values
    expect(result.current.canvasRef).toBe(mockCanvasRef);
    expect(typeof result.current.clearCanvas).toBe('function');
  });

  it('should not render to canvas when stream is null', () => {
    renderHook(() =>
      useCanvasRenderer({
        videoRef: mockVideoRef,
        stream: null,
        isActive: true,
      }),
    );

    // Verify animation frame was not requested
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('should not render to canvas when isActive is false', () => {
    renderHook(() =>
      useCanvasRenderer({
        videoRef: mockVideoRef,
        stream: mockStream,
        isActive: false,
      }),
    );

    // Verify animation frame was not requested
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('should render video to canvas when all dependencies are provided', () => {
    // Setup initial canvas dimensions
    mockCanvas.width = 0;
    mockCanvas.height = 0;

    renderHook(() =>
      useCanvasRenderer({
        videoRef: mockVideoRef,
        stream: mockStream,
        isActive: true,
      }),
    );

    // Get animation frame callback
    expect(window.requestAnimationFrame).toHaveBeenCalled();
    const rafCallback = vi.mocked(window.requestAnimationFrame).mock.calls[0][0];

    // Execute animation frame callback
    rafCallback(0);

    // Verify canvas dimensions were updated
    expect(mockCanvas.width).toBe(mockVideo.videoWidth);
    expect(mockCanvas.height).toBe(mockVideo.videoHeight);

    // Verify context operations
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1); // Mirror horizontally
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      mockVideo,
      -mockCanvas.width,
      0,
      mockCanvas.width,
      mockCanvas.height,
    );
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('should cancel animation frame on cleanup', () => {
    const { unmount } = renderHook(() =>
      useCanvasRenderer({
        videoRef: mockVideoRef,
        stream: mockStream,
        isActive: true,
      }),
    );

    // Trigger cleanup by unmounting
    unmount();

    // Verify cancelAnimationFrame was called
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(123);
  });

  it('should clear canvas when clearCanvas is called', () => {
    // Set initial canvas dimensions
    mockCanvas.width = 640;
    mockCanvas.height = 480;

    const { result } = renderHook(() =>
      useCanvasRenderer({
        videoRef: mockVideoRef,
        stream: mockStream,
        isActive: true,
      }),
    );

    // Call clearCanvas function
    result.current.clearCanvas();

    // Verify clearRect was called with correct dimensions
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
  });
});
