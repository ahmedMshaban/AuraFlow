/**
 * Custom hook for loading and managing face-api.js machine learning models.
 * Handles the initialization of facial recognition, landmark detection, and expression analysis models.
 * Provides loading states and error handling for the model initialization process.
 *
 * Model Loading Features:
 * - Automatic model loading on hook initialization
 * - Loading state management for UI feedback
 * - Error handling with user-friendly messages
 * - Model readiness validation
 *
 * Models Loaded:
 * - Face detection model: Identifies faces in video frames
 * - Facial landmark model: Maps 68 facial feature points
 * - Expression recognition model: Analyzes emotional expressions
 * - Additional models for stress analysis accuracy
 *
 * Performance Considerations:
 * - Models are loaded once and cached
 * - Loading happens asynchronously to avoid blocking UI
 * - Models are loaded from optimized CDN or local assets
 * - Total model size is optimized for web performance
 *
 * @returns Object containing loading state, model readiness, and error information
 *
 * @example
 * ```tsx
 * function StressAnalysisComponent() {
 *   const { isLoading, modelsLoaded, error } = useFaceModel();
 *
 *   if (isLoading) {
 *     return <LoadingSpinner message="Loading facial analysis models..." />;
 *   }
 *
 *   if (error) {
 *     return <ErrorMessage message={error} />;
 *   }
 *
 *   if (!modelsLoaded) {
 *     return <div>Preparing facial analysis...</div>;
 *   }
 *
 *   return <FacialAnalysisInterface />;
 * }
 * ```
 *
 * @note Models must be loaded before facial analysis can begin
 * @see {@link faceAnalyzer} for the underlying model management service
 */
import { useState, useEffect } from 'react';

import { faceAnalyzer } from '../services/FaceAnalyzer';
import type { UseFaceModelResult } from '../types/FaceModel.types';

export const useFaceModel = (): UseFaceModelResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load face-api.js models when hook is initialized
   */
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await faceAnalyzer.loadModels();
        setModelsLoaded(true);
        setError(null);
      } catch (err) {
        setError('Failed to load facial analysis models. Please check your connection and try again.');
        console.error('Error loading models:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  return {
    isLoading,
    modelsLoaded,
    error,
  };
};
