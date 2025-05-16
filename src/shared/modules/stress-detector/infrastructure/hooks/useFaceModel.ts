/**
 * A custom hook for loading and managing face-api.js models
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
