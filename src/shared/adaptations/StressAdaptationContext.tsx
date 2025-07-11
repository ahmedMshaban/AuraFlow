import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useStressMonitoring } from '../hooks/useStressMonitoring';
import { useStressAnalytics } from '../hooks/useStressAnalytics';
import * as adaptations from './stressAdaptations.types';

/**
 * Type definition for the stress adaptation context providing comprehensive stress management state.
 * Includes UI adaptations, stress analytics, manual mode controls, and break management functionality.
 */
interface StressAdaptationContextType {
  /** Current UI theme adaptation based on stress level */
  theme: 'default' | 'calm';
  /** Whether to simplify UI elements for reduced cognitive load */
  simplifyUI: boolean;
  /** Whether to reduce notification frequency during stress */
  reduceNotifications: boolean;
  /** Suggested interval between breaks in minutes based on stress level */
  suggestedBreakInterval: number;
  /** Contextual motivational message for current stress state */
  motivationalMessage: string;

  /** Current stress state from analytics */
  isCurrentlyStressed: boolean;
  /** Average stress level over recent period */
  averageStressLevel: number | null;
  /** Current stress as percentage (0-100) */
  stressPercentage: number;

  /** Whether manual stress mode is currently enabled for testing */
  isManualStressModeEnabled: boolean;
  /** Toggle function for manual stress mode */
  toggleManualStressMode: () => void;

  /** Trigger immediate break suggestion */
  suggestBreakNow: () => void;
  /** Dismiss current break suggestion and record break time */
  dismissBreakSuggestion: () => void;

  /** Whether a break is currently being suggested */
  isBreakSuggested: boolean;
  /** Timestamp of last break taken */
  lastBreakTime: number | null;
}

/**
 * React context for managing stress adaptations across the application.
 * Provides centralized stress state and adaptation logic for all components.
 */
const StressAdaptationContext = createContext<StressAdaptationContextType | null>(null);

/**
 * Props for the StressAdaptationProvider component.
 */
interface StressAdaptationProviderProps {
  /** Child components that will have access to stress adaptation context */
  children: ReactNode;
}

/**
 * Provider component that manages stress adaptation state and provides context to child components.
 * Integrates stress monitoring, analytics, and adaptive UI behaviors into a centralized context
 * that components can consume for stress-aware functionality.
 *
 * Features:
 * - Real-time stress level monitoring and analytics integration
 * - Dynamic UI adaptation based on stress levels (theme, simplification, notifications)
 * - Intelligent break suggestion system with timing management
 * - Manual stress mode for testing and development
 * - Motivational messaging system with context awareness
 * - Break tracking and timing management
 * - Memoized context value for optimal performance
 *
 * Stress Adaptations:
 * - Theme: Switches between default and calm themes based on stress
 * - UI Simplification: Reduces interface complexity during high stress
 * - Notification Management: Controls notification frequency during stress
 * - Break Intervals: Suggests optimal break timing based on stress patterns
 * - Motivational Messaging: Provides contextual encouragement and guidance
 *
 * @param props - The provider props
 * @param props.children - Child components that will receive stress adaptation context
 * @returns Provider component wrapping children with stress adaptation context
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * <StressAdaptationProvider>
 *   <App />
 * </StressAdaptationProvider>
 *
 * // Use context in components
 * const { theme, isCurrentlyStressed, suggestBreakNow } = useStressAdaptation();
 * ```
 *
 * @note Provider integrates with stress monitoring and analytics hooks
 * @note Context value is memoized for performance optimization
 * @see {@link useStressMonitoring} For real-time stress detection
 * @see {@link useStressAnalytics} For stress analytics and patterns
 * @see {@link useStressAdaptation} For consuming the context
 */
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

/**
 * Custom hook for accessing stress adaptation context and functionality.
 * Provides components with access to stress-based UI adaptations, analytics,
 * break management, and manual stress mode controls.
 *
 * Features:
 * - Access to current stress level and analytics
 * - UI adaptation states (theme, simplification, notifications)
 * - Break suggestion and management functionality
 * - Manual stress mode for testing and development
 * - Motivational messaging based on stress context
 * - Real-time updates as stress levels change
 *
 * @returns {StressAdaptationContextType} Complete stress adaptation state and controls
 * @throws {Error} When used outside of StressAdaptationProvider
 *
 * @example
 * ```tsx
 * const StressAwareComponent = () => {
 *   const {
 *     theme,
 *     simplifyUI,
 *     isCurrentlyStressed,
 *     suggestBreakNow,
 *     motivationalMessage
 *   } = useStressAdaptation();
 *
 *   return (
 *     <div className={`theme-${theme} ${simplifyUI ? 'simplified' : ''}`}>
 *       {isCurrentlyStressed && (
 *         <div className="stress-indicator">
 *           <p>{motivationalMessage}</p>
 *           <button onClick={suggestBreakNow}>Take a Break</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 *
 * @note Must be used within a StressAdaptationProvider component tree
 * @note Hook provides real-time updates as stress conditions change
 * @see {@link StressAdaptationProvider} For context provider setup
 * @see {@link StressAdaptationContextType} For complete type definition
 */
export const useStressAdaptation = (): StressAdaptationContextType => {
  const context = useContext(StressAdaptationContext);

  if (!context) {
    throw new Error('useStressAdaptation must be used within a StressAdaptationProvider');
  }

  return context;
};
