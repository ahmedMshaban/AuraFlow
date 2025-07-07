import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useStressMonitoring } from '../hooks/useStressMonitoring';
import { useStressAnalytics } from '../hooks/useStressAnalytics';
import * as adaptations from './stressAdaptations.types';

// Type for the stress adaptation context
interface StressAdaptationContextType {
  // Current UI adaptations
  theme: 'default' | 'calm';
  simplifyUI: boolean;
  reduceNotifications: boolean;
  suggestedBreakInterval: number;
  motivationalMessage: string;

  // Stress analytics
  isCurrentlyStressed: boolean;
  averageStressLevel: number | null;
  stressPercentage: number;

  // Manual stress mode
  isManualStressModeEnabled: boolean;
  toggleManualStressMode: () => void;

  // Actions
  suggestBreakNow: () => void;
  dismissBreakSuggestion: () => void;

  // State
  isBreakSuggested: boolean;
  lastBreakTime: number | null;
}

// Create context with a default value
const StressAdaptationContext = createContext<StressAdaptationContextType | null>(null);

// Props for the provider component
interface StressAdaptationProviderProps {
  children: ReactNode;
}

export const StressAdaptationProvider: React.FC<StressAdaptationProviderProps> = ({ children }) => {
  // Get stress data from our hooks
  const { lastStressResult, isManualStressModeEnabled, toggleManualStressMode } = useStressMonitoring();
  const { isCurrentlyStressed, averageStressLevel, stressPercentage } = useStressAnalytics();

  // Break suggestion state
  const [isBreakSuggested, setIsBreakSuggested] = useState(false);
  const [lastBreakTime, setLastBreakTime] = useState<number | null>(null);

  // Calculate stress adaptations
  // When manual stress mode is enabled, force high stress level for adaptations
  const actualStressLevel = lastStressResult?.stressLevel ?? 0;
  const stressLevel = isManualStressModeEnabled ? 85 : actualStressLevel; // Force high stress when manual mode is on

  const isDominantExpression = (expression: string) => {
    return lastStressResult?.dominantExpression === expression;
  };

  // Compute all adaptations based on current stress level
  const theme = adaptations.getAdaptedTheme({ stressLevel });
  const simplifyUI = adaptations.shouldSimplifyUI({ stressLevel });
  const reduceNotifications = adaptations.shouldReduceNotifications({ stressLevel });
  const suggestedBreakInterval = adaptations.getSuggestedBreakInterval({ stressLevel });
  const motivationalMessage = adaptations.getMotivationalMessage({
    stressLevel,
    isDominantExpression,
  });

  // Check if we should suggest a break based on time since last break
  useEffect(() => {
    if (!lastBreakTime) return;

    const timeSinceLastBreak = Date.now() - lastBreakTime;
    const shouldSuggest = adaptations.shouldSuggestBreak({ stressLevel }, timeSinceLastBreak);

    if (shouldSuggest && !isBreakSuggested) {
      setIsBreakSuggested(true);
    }
  }, [lastBreakTime, stressLevel, isBreakSuggested]);

  // Actions
  const suggestBreakNow = () => {
    setIsBreakSuggested(true);
  };

  const dismissBreakSuggestion = () => {
    setIsBreakSuggested(false);
    setLastBreakTime(Date.now());
  };

  // Create context value
  const contextValue = useMemo(
    () => ({
      // Current UI adaptations
      theme,
      simplifyUI,
      reduceNotifications,
      suggestedBreakInterval,
      motivationalMessage,

      // Stress analytics
      isCurrentlyStressed: isCurrentlyStressed || false,
      averageStressLevel: averageStressLevel || 0,
      stressPercentage,

      // Manual stress mode
      isManualStressModeEnabled,
      toggleManualStressMode,

      // Actions
      suggestBreakNow,
      dismissBreakSuggestion,

      // State
      isBreakSuggested,
      lastBreakTime,
    }),
    [
      theme,
      simplifyUI,
      reduceNotifications,
      suggestedBreakInterval,
      motivationalMessage,
      isCurrentlyStressed,
      averageStressLevel,
      stressPercentage,
      isManualStressModeEnabled,
      toggleManualStressMode,
      isBreakSuggested,
      lastBreakTime,
    ],
  );

  return <StressAdaptationContext.Provider value={contextValue}>{children}</StressAdaptationContext.Provider>;
};

// Custom hook to use the stress adaptation context
export const useStressAdaptation = (): StressAdaptationContextType => {
  const context = useContext(StressAdaptationContext);

  if (!context) {
    throw new Error('useStressAdaptation must be used within a StressAdaptationProvider');
  }

  return context;
};
