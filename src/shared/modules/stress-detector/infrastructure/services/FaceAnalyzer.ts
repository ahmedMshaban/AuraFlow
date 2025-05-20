/**
 * FaceAnalyzer.ts
 *
 * A service that uses face-api.js to detect facial expressions
 * and analyze them for stress indicators.
 */

import * as faceapi from 'face-api.js';
import type { FaceExpressions, StressAnalysisResult } from '../types/FaceExpressions.types';

/**
 * Class for analyzing facial expressions and detecting stress levels
 */
export class FaceAnalyzer {
  private modelsLoaded: boolean = false;
  private isLoading: boolean = false;

  /**
   * Load required face-api.js models
   */
  public async loadModels(): Promise<void> {
    // Don't load models if they're already loaded or being loaded
    if (this.modelsLoaded || this.isLoading) {
      return;
    }

    try {
      this.isLoading = true;
      console.log('Loading face-api.js models...');

      // Set models path
      const modelsPath = '/models';

      // Load required models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelsPath),
      ]);

      this.modelsLoaded = true;
      this.isLoading = false;
      console.log('✅ face-api.js models loaded');
    } catch (error) {
      this.isLoading = false;
      console.error('❌ Error loading face-api.js models:', error);
      throw new Error('Failed to load face-api.js models');
    }
  }

  /**
   * Detects facial expressions in a video element
   */ public async detectExpressions(
    video: HTMLVideoElement,
  ): Promise<faceapi.WithFaceExpressions<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
  > | null> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded. Call loadModels() first');
    }

    try {
      // Use tiny face detector for better performance
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

      // Detect face with expressions
      const result = await faceapi.detectSingleFace(video, options).withFaceLandmarks().withFaceExpressions();

      return result || null;
    } catch (error) {
      console.error('Error detecting expressions:', error);
      return null;
    }
  }
  /**
   * Analyzes facial expressions to determine stress level
   *
   * This method determines stress by checking if one of the negative emotions
   * (angry, fearful, disgusted, sad) is the dominant facial expression.
   */
  public analyzeStress(expressions: FaceExpressions): StressAnalysisResult {
    // Find dominant expression
    const dominantExpression = Object.entries(expressions).reduce(
      (max, [expression, score]) => (score > max[1] ? [expression, score] : max),
      ['none', 0],
    )[0];

    // Check if the dominant expression is one of the stress indicators
    const stressIndicators = ['angry', 'fearful', 'disgusted', 'sad'];
    const isStressed = stressIndicators.includes(dominantExpression);

    // Still calculate a stress level for backward compatibility
    // but it's simply 100 if stressed, 0 if not
    const stressLevel = isStressed ? 100 : 0;

    return {
      stressLevel,
      dominantExpression,
      expressions,
      isStressed,
      timestamp: new Date(),
    };
  }
}

// Export a singleton instance
export const faceAnalyzer = new FaceAnalyzer();
