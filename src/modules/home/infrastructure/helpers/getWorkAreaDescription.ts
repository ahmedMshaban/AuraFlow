export const getEmailDescription = (isCurrentlyStressed: boolean) => {
  if (isCurrentlyStressed) {
    return 'Showing only essential emails to reduce cognitive load';
  }
  return 'Organized email view with focused and other emails for better clarity';
};

export const getTaskDescription = (isCurrentlyStressed: boolean) => {
  if (isCurrentlyStressed) {
    return 'Simplified task view focused on immediate priorities';
  }
  return 'Stress-aware task organization for better productivity';
};
