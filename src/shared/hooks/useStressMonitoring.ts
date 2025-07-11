import { useSelector, useDispatch } from 'react-redux';
import {
  selectLastStressResult,
  selectLastTestTimestamp,
  selectStressHistory,
  selectTestInterval,
  selectAutoTestEnabled,
  selectManualStressModeEnabled,
  setTestInterval,
  setAutoTestEnabled,
  setManualStressModeEnabled,
  clearStressHistory,
} from '../store/slices/stressMonitoringSlice';
import { stressMonitoringService } from '../services/stressMonitoringService';

/**
 * Primary hook for stress monitoring functionality and real-time stress detection.
 * Manages facial expression analysis, stress level tracking, and automated testing.
 * Provides comprehensive stress monitoring controls and data access.
 *
 * Core Features:
 * - Real-time facial expression detection
 * - Automated stress testing at configurable intervals
 * - Manual stress mode for testing and demonstration
 * - Historical stress data management
 * - Configurable monitoring settings
 *
 * Monitoring Capabilities:
 * - Continuous facial expression analysis
 * - Stress level calculation based on expressions
 * - Automated periodic stress assessments
 * - Manual trigger for immediate stress testing
 * - Historical data tracking and storage
 *
 * Configuration Options:
 * - Adjustable test intervals (minutes)
 * - Auto-testing enable/disable
 * - Manual stress mode toggle
 * - History data management
 *
 * @returns Object containing stress data, settings, and control functions
 *
 * @example
 * ```tsx
 * function StressControls() {
 *   const {
 *     lastStressResult,
 *     isManualStressModeEnabled,
 *     triggerStressTest,
 *     setInterval,
 *     toggleManualStressMode
 *   } = useStressMonitoring();
 *
 *   return (
 *     <div>
 *       <Text>Current Stress: {lastStressResult?.stressLevel}%</Text>
 *       <Button onClick={triggerStressTest}>Test Now</Button>
 *       <Switch
 *         isChecked={isManualStressModeEnabled}
 *         onChange={toggleManualStressMode}
 *       >
 *         Manual Mode
 *       </Switch>
 *     </div>
 *   );
 * }
 * ```
 *
 * @note Requires camera access for facial expression detection
 * @see {@link useStressAnalytics} for processed analytics from this data
 * @see {@link StressAdaptation} for UI adaptations based on stress levels
 */
export const useStressMonitoring = () => {
  const dispatch = useDispatch();

  // Selectors
  const lastStressResult = useSelector(selectLastStressResult);
  const lastTestTimestamp = useSelector(selectLastTestTimestamp);
  const stressHistory = useSelector(selectStressHistory);
  const testInterval = useSelector(selectTestInterval);
  const autoTestEnabled = useSelector(selectAutoTestEnabled);
  const isManualStressModeEnabled = useSelector(selectManualStressModeEnabled);

  // Time helpers
  const getLastTestTime = () => {
    if (!lastTestTimestamp) return null;
    return new Date(lastTestTimestamp);
  };

  const getTimeUntilNextTest = () => {
    if (!lastTestTimestamp || !autoTestEnabled) return null;

    const nextTestTime = lastTestTimestamp + testInterval * 60 * 1000;
    const timeRemaining = nextTestTime - Date.now();

    return timeRemaining > 0 ? timeRemaining : 0;
  };

  // Actions
  const triggerStressTest = () => {
    stressMonitoringService.triggerStressTest();
  };

  const setInterval = (minutes: number) => {
    dispatch(setTestInterval(minutes));
    // Reschedule with new interval
    stressMonitoringService.scheduleNextTest();
  };

  const setAutoTest = (enabled: boolean) => {
    dispatch(setAutoTestEnabled(enabled));
  };

  const toggleManualStressMode = () => {
    dispatch(setManualStressModeEnabled(!isManualStressModeEnabled));
  };

  const clearHistory = () => {
    dispatch(clearStressHistory());
  };

  // Return all the necessary data and functions
  return {
    // Data
    lastStressResult,
    lastTestTime: getLastTestTime(),
    timeUntilNextTest: getTimeUntilNextTest(),
    stressHistory,
    testInterval,
    autoTestEnabled,
    isManualStressModeEnabled,

    // Actions
    triggerStressTest,
    setInterval,
    setAutoTest,
    toggleManualStressMode,
    clearHistory,
  };
};
