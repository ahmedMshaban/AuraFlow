import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useStressMonitoring } from './useStressMonitoring';
import { selectManualStressModeEnabled } from '../store/slices/stressMonitoringSlice';

/**
 * Hook to analyze stress data and provide insights
 */
export const useStressAnalytics = () => {
  const { stressHistory, lastStressResult } = useStressMonitoring();
  const isManualStressModeEnabled = useSelector(selectManualStressModeEnabled);

  // Calculate average stress level from history
  const averageStressLevel = useMemo(() => {
    if (!stressHistory.length) return null;

    const sum = stressHistory.reduce((total, entry) => total + entry.stressLevel, 0);
    return sum / stressHistory.length;
  }, [stressHistory]);

  // Calculate stress trend over time periods
  const stressTrends = useMemo(() => {
    if (stressHistory.length < 2) return { hour: 0, day: 0, week: 0 };

    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Filter entries by time periods
    const hourEntries = stressHistory.filter((entry) => entry.timestamp > hourAgo);
    const dayEntries = stressHistory.filter((entry) => entry.timestamp > dayAgo);
    const weekEntries = stressHistory.filter((entry) => entry.timestamp > weekAgo);

    // Calculate average for each period
    const hourAvg = hourEntries.length
      ? hourEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) / hourEntries.length
      : null;

    const dayAvg = dayEntries.length
      ? dayEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) / dayEntries.length
      : null;

    const weekAvg = weekEntries.length
      ? weekEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) / weekEntries.length
      : null;

    return { hour: hourAvg, day: dayAvg, week: weekAvg };
  }, [stressHistory]);

  // Determine if the user is currently stressed
  const isCurrentlyStressed = useMemo(() => {
    // If manual stress mode is enabled, always return true
    if (isManualStressModeEnabled) return true;

    if (!lastStressResult) return false;
    return lastStressResult.isStressed;
  }, [lastStressResult, isManualStressModeEnabled]);

  // Calculate percentage of time the user appears stressed
  const stressPercentage = useMemo(() => {
    if (!stressHistory.length) return 0;

    const stressedEntries = stressHistory.filter((entry) => entry.stressLevel >= 50);
    return (stressedEntries.length / stressHistory.length) * 100;
  }, [stressHistory]);

  // Get most common stressed expression
  const dominantStressExpression = useMemo(() => {
    if (!stressHistory.length) return null;

    // Only consider stressed entries
    const stressedEntries = stressHistory.filter((entry) => entry.stressLevel >= 50);
    if (!stressedEntries.length) return null;

    // Count occurrences of each expression
    const expressionCounts: Record<string, number> = {};
    stressedEntries.forEach((entry) => {
      expressionCounts[entry.dominantExpression] = (expressionCounts[entry.dominantExpression] || 0) + 1;
    });

    // Find the most common expression
    let maxCount = 0;
    let dominantExpression = null;

    Object.entries(expressionCounts).forEach(([expression, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantExpression = expression;
      }
    });

    return dominantExpression;
  }, [stressHistory]);

  return {
    averageStressLevel,
    stressTrends,
    isCurrentlyStressed,
    stressPercentage,
    dominantStressExpression,
    // Include raw data for reference
    stressHistory,
    lastStressResult,
  };
};
