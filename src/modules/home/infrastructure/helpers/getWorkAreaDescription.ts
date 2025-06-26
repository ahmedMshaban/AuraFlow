/**
 * Gets descriptive text for the email section based on stress state
 * @param isCurrentlyStressed - Whether the user is currently in a stressed state
 * @returns Appropriate description text for the email section
 * @example
 * getEmailDescription(true) // "Showing only essential emails to reduce cognitive load"
 * getEmailDescription(false) // "Organized email view with focused and other emails for better clarity"
 */
export const getEmailDescription = (isCurrentlyStressed: boolean): string => {
  if (isCurrentlyStressed) {
    return 'Showing only essential emails to reduce cognitive load';
  }
  return 'Organized email view with focused and other emails for better clarity';
};

/**
 * Gets descriptive text for the task section based on stress state
 * @param isCurrentlyStressed - Whether the user is currently in a stressed state
 * @returns Appropriate description text for the task section
 * @example
 * getTaskDescription(true) // "Simplified task view focused on immediate priorities"
 * getTaskDescription(false) // "Stress-aware task organization for better productivity"
 */
export const getTaskDescription = (isCurrentlyStressed: boolean): string => {
  if (isCurrentlyStressed) {
    return 'Simplified task view focused on immediate priorities';
  }
  return 'Stress-aware task organization for better productivity';
};
