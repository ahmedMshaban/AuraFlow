// Helper functions for activities module
// This can be expanded based on future requirements

export const getActivityDescription = (isStressed: boolean) => {
  return isStressed
    ? 'Focus on calming activities to reduce stress'
    : 'Engage in productive activities to maintain wellness';
};

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

export const formatDuration = (duration?: string): string => {
  return duration || 'Variable';
};

export const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'breathing':
      return '#667eea';
    case 'mindfulness':
      return '#764ba2';
    case 'exercise':
      return '#50c878';
    default:
      return '#667eea';
  }
};

export const formatActivityData = (data: unknown) => {
  // Add formatting logic when data structure is defined
  return data;
};
