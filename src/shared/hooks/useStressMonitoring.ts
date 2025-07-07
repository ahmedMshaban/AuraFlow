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
 * Custom hook for working with stress monitoring data
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
