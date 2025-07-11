/**
 * Gets an appropriate activity description based on the user's stress level.
 * Provides contextual guidance to help users choose suitable activities.
 *
 * @param isStressed - Whether the user is currently experiencing stress
 * @returns A descriptive message guiding activity selection
 *
 * @example
 * ```typescript
 * // For stressed users
 * getActivityDescription(true);
 * // Returns: "Focus on calming activities to reduce stress"
 *
 * // For non-stressed users
 * getActivityDescription(false);
 * // Returns: "Engage in productive activities to maintain wellness"
 * ```
 */
export const getActivityDescription = (isStressed: boolean) => {
  return isStressed
    ? 'Focus on calming activities to reduce stress'
    : 'Engage in productive activities to maintain wellness';
};

/**
 * Returns a color code corresponding to the activity difficulty level.
 * Uses a standard color scheme: green for easy, yellow for medium, red for hard.
 *
 * @param difficulty - The difficulty level of the activity ('Easy', 'Medium', or 'Hard')
 * @returns A hex color code representing the difficulty level
 *
 * @example
 * ```typescript
 * getDifficultyColor('Easy');   // Returns: '#50c878' (green)
 * getDifficultyColor('Medium'); // Returns: '#ffc107' (yellow)
 * getDifficultyColor('Hard');   // Returns: '#dc3545' (red)
 * getDifficultyColor('Invalid'); // Returns: '#50c878' (default green)
 * ```
 *
 * @note The function is case-sensitive and returns the default green color for any unrecognized input
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy':
      return '#50c878';
    case 'Medium':
      return '#ffc107';
    case 'Hard':
      return '#dc3545';
    default:
      return '#50c878';
  }
};

/**
 * Formats the duration string for display, providing a fallback for missing values.
 * Preserves the original duration format when provided, or returns a sensible default.
 *
 * @param duration - Optional duration string (e.g., "5 min", "10-15 minutes")
 * @returns The formatted duration string or "Variable" if no duration provided
 *
 * @example
 * ```typescript
 * formatDuration('5 min');        // Returns: '5 min'
 * formatDuration('10-15 minutes'); // Returns: '10-15 minutes'
 * formatDuration(undefined);      // Returns: 'Variable'
 * formatDuration('');             // Returns: 'Variable'
 * ```
 *
 * @note This function handles various duration formats and provides consistency across the UI
 */
export const formatDuration = (duration?: string): string => {
  return duration || 'Variable';
};

/**
 * Returns a color code corresponding to the activity category.
 * Provides visual categorization using distinct colors for each activity type.
 *
 * @param category - The category name (case-insensitive)
 * @returns A hex color code representing the category
 *
 * @example
 * ```typescript
 * getCategoryColor('breathing');   // Returns: '#667eea' (blue)
 * getCategoryColor('Mindfulness'); // Returns: '#764ba2' (purple)
 * getCategoryColor('EXERCISE');    // Returns: '#50c878' (green)
 * getCategoryColor('creative');    // Returns: '#ff6b6b' (red)
 * getCategoryColor('unknown');     // Returns: '#667eea' (default blue)
 * ```
 *
 * @note The function is case-insensitive and returns the default blue color for unrecognized categories
 */
export const getCategoryColor = (category: string): string => {
  if (!category) {
    return '#667eea';
  }

  switch (category.toLowerCase()) {
    case 'breathing':
      return '#667eea';
    case 'mindfulness':
      return '#764ba2';
    case 'exercise':
      return '#50c878';
    case 'creative':
      return '#ff6b6b';
    default:
      return '#667eea';
  }
};
