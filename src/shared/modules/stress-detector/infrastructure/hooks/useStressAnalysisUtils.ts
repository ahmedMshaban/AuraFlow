/**
 * A custom hook for stress analysis utilities and formatters
 */
import { useMemo } from 'react';

import type { StressAnalysisResult } from '../types/FaceExpressions.types';
import type { UseStressAnalysisUtilsResult } from '../types/FaceAnalysis.types';

export const useStressAnalysisUtils = (): UseStressAnalysisUtilsResult => {
  /**
   * Format stress level as text
   */
  const getStressLevelText = useMemo(() => {
    return (level: number): string => {
      if (level < 30) return 'Low';
      if (level < 65) return 'Moderate';
      return 'High';
    };
  }, []);

  /**
   * Get recommendations based on stress level
   */
  const getRecommendations = useMemo(() => {
    return (result: StressAnalysisResult): string[] => {
      const baseRecommendations = [
        'Take slow, deep breaths for 2 minutes',
        'Stretch your body gently',
        'Stay hydrated',
      ];

      if (result.stressLevel > 65) {
        return [
          ...baseRecommendations,
          'Consider taking a short break from your current task',
          'Try a quick meditation exercise',
          'If stress persists, consider speaking with a professional',
        ];
      } else if (result.stressLevel > 30) {
        return [...baseRecommendations, 'Take a short walk if possible', 'Consider doing a brief mindfulness exercise'];
      } else {
        return [
          ...baseRecommendations,
          'Continue with your current activities',
          'Schedule regular breaks to maintain your wellbeing',
        ];
      }
    };
  }, []);

  return {
    getStressLevelText,
    getRecommendations,
  };
};
