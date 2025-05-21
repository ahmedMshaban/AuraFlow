/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FaceAnalyzer } from './FaceAnalyzer';
import type { FaceExpressions } from '../types/FaceExpressions.types';

// Setup mocks
vi.mock('face-api.js', () => {
  return {
    nets: {
      tinyFaceDetector: {
        loadFromUri: vi.fn().mockResolvedValue(undefined),
      },
      faceLandmark68Net: {
        loadFromUri: vi.fn().mockResolvedValue(undefined),
      },
      faceExpressionNet: {
        loadFromUri: vi.fn().mockResolvedValue(undefined),
      },
    },
    detectSingleFace: vi.fn(),
    TinyFaceDetectorOptions: vi.fn().mockImplementation(() => ({
      inputSize: 224,
      scoreThreshold: 0.5,
    })),
  };
});

// Import the mocked module
import * as faceapi from 'face-api.js';

describe('FaceAnalyzer', () => {
  let faceAnalyzer: FaceAnalyzer;
  let mockVideo: HTMLVideoElement;

  // Setup for the withFaceLandmarks and withFaceExpressions chain
  const mockWithFaceLandmarks = vi.fn();
  const mockWithFaceExpressions = vi.fn();

  beforeEach(() => {
    faceAnalyzer = new FaceAnalyzer();
    mockVideo = document.createElement('video');
    vi.clearAllMocks();

    // Setup chain for fluent API
    (faceapi.detectSingleFace as ReturnType<typeof vi.fn>).mockReturnValue({
      withFaceLandmarks: mockWithFaceLandmarks,
    });

    mockWithFaceLandmarks.mockReturnValue({
      withFaceExpressions: mockWithFaceExpressions,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should initialize properly', () => {
    expect(faceAnalyzer).toBeDefined();
  });

  it('should load models successfully', async () => {
    await faceAnalyzer.loadModels();
    // Check that all model loading functions were called
    expect(faceapi.nets.tinyFaceDetector.loadFromUri).toHaveBeenCalledWith('/models');
    expect(faceapi.nets.faceLandmark68Net.loadFromUri).toHaveBeenCalledWith('/models');
    expect(faceapi.nets.faceExpressionNet.loadFromUri).toHaveBeenCalledWith('/models');
  });

  it('should not load models twice', async () => {
    // Load models first time
    await faceAnalyzer.loadModels();

    // Reset the mock calls
    vi.clearAllMocks();

    // Try loading again
    await faceAnalyzer.loadModels();

    // The loading functions should not be called again
    expect(faceapi.nets.tinyFaceDetector.loadFromUri).not.toHaveBeenCalled();
    expect(faceapi.nets.faceLandmark68Net.loadFromUri).not.toHaveBeenCalled();
    expect(faceapi.nets.faceExpressionNet.loadFromUri).not.toHaveBeenCalled();
  });

  it('should throw error if models fail to load', async () => {
    // Make loadFromUri reject
    (faceapi.nets.tinyFaceDetector.loadFromUri as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error'),
    );

    await expect(faceAnalyzer.loadModels()).rejects.toThrow('Failed to load face-api.js models');
  });

  it('should throw error if detecting expressions before loading models', async () => {
    await expect(faceAnalyzer.detectExpressions(mockVideo)).rejects.toThrow(
      'Models not loaded. Call loadModels() first',
    );
  });

  it('should detect expressions after loading models', async () => {
    // Setup mock result
    const mockResult = {
      detection: { box: { x: 0, y: 0, width: 100, height: 100 } },
      landmarks: {},
      expressions: {
        angry: 0.1,
        disgusted: 0.01,
        fearful: 0.01,
        happy: 0.8,
        neutral: 0.05,
        sad: 0.02,
        surprised: 0.01,
      },
    };

    mockWithFaceExpressions.mockResolvedValue(mockResult);

    // Load models first
    await faceAnalyzer.loadModels();

    // Then detect expressions
    const result = await faceAnalyzer.detectExpressions(mockVideo);

    // Verify the result
    expect(result).toBe(mockResult);
    expect(faceapi.detectSingleFace).toHaveBeenCalledWith(mockVideo, expect.any(Object));
  });

  it('should handle null detection results gracefully', async () => {
    // Setup mock to return null
    mockWithFaceExpressions.mockResolvedValue(null);

    // Load models first
    await faceAnalyzer.loadModels();

    // Then detect expressions
    const result = await faceAnalyzer.detectExpressions(mockVideo);

    // Result should be null
    expect(result).toBeNull();
  });

  it('should analyze stress and detect stressed state when angry', () => {
    const expressions: FaceExpressions = {
      angry: 0.8,
      disgusted: 0.01,
      fearful: 0.01,
      happy: 0.05,
      neutral: 0.1,
      sad: 0.02,
      surprised: 0.01,
    };

    const result = faceAnalyzer.analyzeStress(expressions);

    expect(result.stressLevel).toBe(100);
    expect(result.dominantExpression).toBe('angry');
    expect(result.isStressed).toBe(true);
    expect(result.expressions).toBe(expressions);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should analyze stress and detect non-stressed state when happy', () => {
    const expressions: FaceExpressions = {
      angry: 0.05,
      disgusted: 0.01,
      fearful: 0.01,
      happy: 0.8,
      neutral: 0.1,
      sad: 0.02,
      surprised: 0.01,
    };

    const result = faceAnalyzer.analyzeStress(expressions);

    expect(result.stressLevel).toBe(0);
    expect(result.dominantExpression).toBe('happy');
    expect(result.isStressed).toBe(false);
    expect(result.expressions).toBe(expressions);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should analyze stress and detect stressed state for each stress indicator', () => {
    const stressIndicators = ['angry', 'fearful', 'disgusted', 'sad'];

    stressIndicators.forEach((indicator) => {
      // Create expressions with this indicator as dominant
      const expressions: FaceExpressions = {
        angry: indicator === 'angry' ? 0.8 : 0.01,
        disgusted: indicator === 'disgusted' ? 0.8 : 0.01,
        fearful: indicator === 'fearful' ? 0.8 : 0.01,
        happy: 0.05,
        neutral: 0.1,
        sad: indicator === 'sad' ? 0.8 : 0.01,
        surprised: 0.01,
      };

      const result = faceAnalyzer.analyzeStress(expressions);

      expect(result.stressLevel).toBe(100);
      expect(result.dominantExpression).toBe(indicator);
      expect(result.isStressed).toBe(true);
    });
  });
});
