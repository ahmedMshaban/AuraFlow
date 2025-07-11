/**
 * Stress adaptation system for dynamic UI and behavioral adjustments.
 * This module contains functions and types that adapt the interface and user experience
 * based on real-time stress level analysis and facial expression recognition.
 *
 * The adaptation system provides intelligent responses to user stress including:
 * - Theme adjustments for visual comfort
 * - UI simplification during cognitive overload
 * - Break suggestions with optimal timing
 * - Motivational messaging based on emotional context
 * - Notification management during stress periods
 *
 * @module StressAdaptations
 */

/**
 * Stress level thresholds for triggering different adaptation behaviors.
 * These values are calibrated for optimal user experience and wellbeing.
 */
export const STRESS_THRESHOLDS = {
  /** Low stress threshold (0-30%) - minimal adaptations needed */
  LOW: 30,
  /** Moderate stress threshold (30-60%) - begin supportive adaptations */
  MODERATE: 60,
  /** High stress threshold (60-80%+) - intensive stress reduction measures */
  HIGH: 80,
} as const;

/**
 * Configuration options for stress adaptation functions.
 * Provides context for making intelligent adaptation decisions.
 */
export interface AdaptationOptions {
  /** Current stress level as percentage (0-100) */
  stressLevel: number;
  /** Function to check if a specific facial expression is dominant */
  isDominantExpression?: (expression: string) => boolean;
}

/**
 * Determines the appropriate visual theme based on current stress level.
 * Switches between standard and calming themes to reduce visual stress.
 *
 * @param options - Adaptation options containing stress level
 * @returns Theme identifier for CSS class application
 *
 * @example
 * ```typescript
 * const theme = getAdaptedTheme({ stressLevel: 85 });
 * // Returns: 'calm' for high stress
 *
 * const theme = getAdaptedTheme({ stressLevel: 45 });
 * // Returns: 'default' for low/moderate stress
 * ```
 */
export function getAdaptedTheme({ stressLevel }: AdaptationOptions): 'default' | 'calm' {
  if (stressLevel >= STRESS_THRESHOLDS.HIGH) {
    return 'calm';
  } else {
    return 'default';
  }
}

/**
 * Determines whether the user interface should be simplified to reduce cognitive load.
 * Simplification includes reducing visual complexity, hiding non-essential elements,
 * and streamlining navigation during moderate to high stress periods.
 *
 * @param options - Adaptation options containing stress level
 * @returns True if UI should be simplified, false otherwise
 *
 * @example
 * ```typescript
 * const shouldSimplify = shouldSimplifyUI({ stressLevel: 65 });
 * // Returns: true (stress above moderate threshold)
 * ```
 */
export function shouldSimplifyUI({ stressLevel }: AdaptationOptions): boolean {
  return stressLevel >= STRESS_THRESHOLDS.MODERATE;
}

/**
 * Determines whether notification frequency should be reduced during stress periods.
 * Helps minimize distractions and information overload when users are experiencing
 * moderate to high stress levels.
 *
 * @param options - Adaptation options containing stress level
 * @returns True if notifications should be reduced, false otherwise
 *
 * @example
 * ```typescript
 * const reduceNotifs = shouldReduceNotifications({ stressLevel: 70 });
 * // Returns: true (stress above moderate threshold)
 * ```
 */
export function shouldReduceNotifications({ stressLevel }: AdaptationOptions): boolean {
  return stressLevel >= STRESS_THRESHOLDS.MODERATE;
}

/**
 * Calculates optimal break interval in minutes based on current stress level.
 * Higher stress levels trigger more frequent break suggestions to promote
 * wellbeing and prevent burnout.
 *
 * Break Intervals:
 * - High stress (80%+): 20 minutes - frequent breaks for stress relief
 * - Moderate stress (60-79%): 30 minutes - regular breaks for maintenance
 * - Low stress (0-59%): 45 minutes - standard productivity intervals
 *
 * @param options - Adaptation options containing stress level
 * @returns Suggested break interval in minutes
 *
 * @example
 * ```typescript
 * const interval = getSuggestedBreakInterval({ stressLevel: 85 });
 * // Returns: 20 (minutes between breaks for high stress)
 * ```
 */
export function getSuggestedBreakInterval({ stressLevel }: AdaptationOptions): number {
  if (stressLevel >= STRESS_THRESHOLDS.HIGH) {
    return 20; // Suggest breaks every 20 minutes for high stress
  } else if (stressLevel >= STRESS_THRESHOLDS.MODERATE) {
    return 30; // Suggest breaks every 30 minutes for moderate stress
  } else {
    return 45; // Suggest breaks every 45 minutes for low stress
  }
}

/**
 * Determines whether a break should be suggested based on stress level and elapsed time.
 * Compares time since last break against the recommended interval for current stress level
 * to provide timely break suggestions.
 *
 * @param options - Adaptation options containing stress level
 * @param timeSinceLastBreakMs - Time elapsed since last break in milliseconds
 * @returns True if a break should be suggested now, false otherwise
 *
 * @example
 * ```typescript
 * const shouldBreak = shouldSuggestBreak(
 *   { stressLevel: 75 },
 *   25 * 60 * 1000 // 25 minutes ago
 * );
 * // Returns: false (under 30-minute moderate stress threshold)
 * ```
 */
export function shouldSuggestBreak({ stressLevel }: AdaptationOptions, timeSinceLastBreakMs: number): boolean {
  // Convert suggested interval to milliseconds
  const suggestedIntervalMs = getSuggestedBreakInterval({ stressLevel }) * 60 * 1000;

  // Check if it's time for a break
  return timeSinceLastBreakMs >= suggestedIntervalMs;
}

/**
 * Generates contextual motivational messages based on stress level and facial expressions.
 * Provides personalized encouragement and guidance tailored to the user's current
 * emotional and stress state for better wellbeing support.
 *
 * Message Categories:
 * - High stress with anger: Frustration management and break suggestions
 * - High stress with sadness: Empathetic support and self-care reminders
 * - High stress (general): Stress relief techniques and breathing exercises
 * - Moderate stress: Encouraging break reminders and mindfulness
 * - Low stress: Positive reinforcement and flow state acknowledgment
 *
 * @param options - Adaptation options containing stress level and expression checker
 * @returns Personalized motivational message string
 *
 * @example
 * ```typescript
 * const message = getMotivationalMessage({
 *   stressLevel: 85,
 *   isDominantExpression: (expr) => expr === 'angry'
 * });
 * // Returns: "It seems you might be feeling frustrated..."
 * ```
 */
export function getMotivationalMessage({ stressLevel, isDominantExpression }: AdaptationOptions): string {
  if (stressLevel >= STRESS_THRESHOLDS.HIGH) {
    if (isDominantExpression?.('angry')) {
      return 'It seems you might be feeling frustrated. Taking a short break could help clear your mind.';
    } else if (isDominantExpression?.('sad')) {
      return 'You might be feeling down. Remember to be kind to yourself and take things one step at a time.';
    } else {
      return 'You appear to be experiencing stress. Try taking a few deep breaths or a short walk.';
    }
  } else if (stressLevel >= STRESS_THRESHOLDS.MODERATE) {
    return "You're doing great, but could benefit from a short mindfulness break soon.";
  } else {
    return "You're in a good flow state. Keep up the great work!";
  }
}
