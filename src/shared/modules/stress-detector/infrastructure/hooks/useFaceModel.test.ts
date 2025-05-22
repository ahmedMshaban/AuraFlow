/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFaceModel } from './useFaceModel';
import { faceAnalyzer } from '../services/FaceAnalyzer';

// Mock the FaceAnalyzer service
vi.mock('../services/FaceAnalyzer', () => {
  return {
    faceAnalyzer: {
      loadModels: vi.fn(),
    },
  };
});

describe('useFaceModel', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFaceModel());

    expect(result.current.isLoading).toBe(true); // Initially loading
    expect(result.current.modelsLoaded).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load models successfully', async () => {
    // Mock successful model loading
    vi.mocked(faceAnalyzer.loadModels).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFaceModel());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the final state
    expect(result.current.modelsLoaded).toBe(true);
    expect(result.current.error).toBeNull();
    expect(faceAnalyzer.loadModels).toHaveBeenCalledTimes(1);
  });

  it('should handle loading errors gracefully', async () => {
    // Mock loading failure
    const mockError = new Error('Failed to load models');
    vi.mocked(faceAnalyzer.loadModels).mockRejectedValue(mockError);

    // Mock console.error to prevent it from displaying during test
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFaceModel());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the final state
    expect(result.current.modelsLoaded).toBe(false);
    expect(result.current.error).toBe(
      'Failed to load facial analysis models. Please check your connection and try again.',
    );
    expect(faceAnalyzer.loadModels).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith('Error loading models:', mockError);

    consoleErrorMock.mockRestore();
  });
});
