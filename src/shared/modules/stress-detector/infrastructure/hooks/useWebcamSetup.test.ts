import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebcamSetup } from './useWebcamSetup';

describe('useWebcamSetup', () => {
  it('should return handler functions', () => {
    const { result } = renderHook(() => useWebcamSetup({ onCaptureReady: vi.fn(), onStreamAvailable: vi.fn() }));

    expect(result.current.handleCaptureReady).toBeDefined();
    expect(typeof result.current.handleCaptureReady).toBe('function');
    expect(result.current.handleStreamAvailable).toBeDefined();
    expect(typeof result.current.handleStreamAvailable).toBe('function');
  });

  it('should call onCaptureReady when handleCaptureReady is called', () => {
    const onCaptureReady = vi.fn();
    const { result } = renderHook(() => useWebcamSetup({ onCaptureReady, onStreamAvailable: vi.fn() }));

    result.current.handleCaptureReady();
    expect(onCaptureReady).toHaveBeenCalledTimes(1);
  });

  it('should not throw error when onCaptureReady is not provided', () => {
    const { result } = renderHook(() => useWebcamSetup({ onStreamAvailable: vi.fn() }));

    expect(() => result.current.handleCaptureReady()).not.toThrow();
  });

  it('should call onStreamAvailable with stream when handleStreamAvailable is called', () => {
    const onStreamAvailable = vi.fn();
    const { result } = renderHook(() => useWebcamSetup({ onCaptureReady: vi.fn(), onStreamAvailable }));

    const mockStream = {} as MediaStream;
    result.current.handleStreamAvailable(mockStream);
    expect(onStreamAvailable).toHaveBeenCalledTimes(1);
    expect(onStreamAvailable).toHaveBeenCalledWith(mockStream);
  });

  it('should not throw error when onStreamAvailable is not provided', () => {
    const { result } = renderHook(() => useWebcamSetup({ onCaptureReady: vi.fn() }));

    const mockStream = {} as MediaStream;
    expect(() => result.current.handleStreamAvailable(mockStream)).not.toThrow();
  });
});
