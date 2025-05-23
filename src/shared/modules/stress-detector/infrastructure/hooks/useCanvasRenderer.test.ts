/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCanvasRenderer } from './useCanvasRenderer';

describe('useCanvasRenderer', () => {
  // Mock canvas and context
  const mockContextMethods = {
    save: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
  };

  const mockCtx = {
    ...mockContextMethods,
  } as unknown as CanvasRenderingContext2D;

  // Mock canvas element
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue(mockCtx),
  } as unknown as HTMLCanvasElement;

  // Mock video element with readyState and dimensions
  const mockVideo = {
    readyState: 2, // HAVE_CURRENT_DATA
    videoWidth: 640,
    videoHeight: 480,
  } as unknown as HTMLVideoElement;
  
  // Create refs
  const mockVideoRef = { current: mockVideo };
  const mockCanvasRef = { current: mockCanvas };
  const mockStream = {} as MediaStream;

  // Mock requestAnimationFrame and cancelAnimationFrame
  const originalRAF = window.requestAnimationFrame;
  const originalCAF = window.cancelAnimationFrame;
  
  // Mock useRef to return our mock references
  vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
      ...actual as object,
      useRef: vi.fn().mockImplementation(() => mockCanvasRef),
    };
  });