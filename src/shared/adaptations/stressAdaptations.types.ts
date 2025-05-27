/**
 * Adaptations based on user stress level
 * This module contains functions that adapt the UI and behavior based on stress levels
 */

// Define stress thresholds for adaptations
export const STRESS_THRESHOLDS = {
  LOW: 30,
  MODERATE: 60,
  HIGH: 80,
};

// Types for adaptation options
export interface AdaptationOptions {
  stressLevel: number;
  isDominantExpression?: (expression: string) => boolean;
}

/**
 * Determines the appropriate theme based on stress level
 */
export function getAdaptedTheme({ stressLevel }: AdaptationOptions): 'default' | 'calm' | 'focus' {
  if (stressLevel >= STRESS_THRESHOLDS.HIGH) {
    return 'calm';
  } else if (stressLevel >= STRESS_THRESHOLDS.MODERATE) {
    return 'focus';
  } else {
    return 'default';
  }
}

/**
 * Determines if UI complexity should be reduced based on stress level
 */
export function shouldSimplifyUI({ stressLevel }: AdaptationOptions): boolean {
  return stressLevel >= STRESS_THRESHOLDS.MODERATE;
}

/**
 * Determines if notifications should be reduced based on stress level
 */
export function shouldReduceNotifications({ stressLevel }: AdaptationOptions): boolean {
  return stressLevel >= STRESS_THRESHOLDS.MODERATE;
}

/**
 * Gets suggested break interval in minutes based on stress level
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
 * Determines if a break should be suggested now based on stress level and time since last break
 */
export function shouldSuggestBreak({ stressLevel }: AdaptationOptions, timeSinceLastBreakMs: number): boolean {
  // Convert suggested interval to milliseconds
  const suggestedIntervalMs = getSuggestedBreakInterval({ stressLevel }) * 60 * 1000;

  // Check if it's time for a break
  return timeSinceLastBreakMs >= suggestedIntervalMs;
}

/**
 * Gets motivational message based on stress level
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
