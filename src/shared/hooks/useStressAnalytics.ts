import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useStressMonitoring } from './useStressMonitoring';
import { selectManualStressModeEnabled } from '../store/slices/stressMonitoringSlice';

/**
 * Advanced hook for analyzing stress data and providing actionable insights.
 * Processes stress monitoring history to generate meaningful analytics and trends.
 * Supports both automatic facial expression detection and manual stress mode.
 *
 * Analytics Features:
 * - Average stress level calculations
 * - Time-based stress trend analysis (hour/day/week)
 * - Current stress state determination
 * - Stress frequency percentage tracking
 * - Dominant stress expression identification
 *
 * Trend Analysis:
 * - Hourly stress patterns for immediate awareness
 * - Daily stress trends for routine optimization
 * - Weekly stress patterns for lifestyle insights
 * - Comparative analysis across time periods
 *
 * Manual Mode Support:
 * - Overrides automatic detection when enabled
 * - Allows user-controlled stress state simulation
 * - Useful for testing stress adaptations
 *
 * @returns Object containing comprehensive stress analytics and insights
 *
 * @example
 * ```tsx
 * function StressDashboard() {
 *   const {
 *     averageStressLevel,
 *     isCurrentlyStressed,
 *     stressTrends,
 *     stressPercentage,
 *     dominantStressExpression
 *   } = useStressAnalytics();
 *
 *   return (
 *     <div>
 *       <StressGauge
 *         current={averageStressLevel}
 *         isStressed={isCurrentlyStressed}
 *       />
 *       <TrendChart trends={stressTrends} />
 *       <InsightPanel
 *         percentage={stressPercentage}
 *         expression={dominantStressExpression}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @note Requires stress monitoring to be active for meaningful data
 * @see {@link useStressMonitoring} for raw stress data collection
 * @see {@link useStressAdaptation} for applying analytics to UI adaptations
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
