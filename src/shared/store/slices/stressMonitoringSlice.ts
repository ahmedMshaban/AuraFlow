import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { StressAnalysisResult } from '../../modules/stress-detector/infrastructure/types/FaceExpressions.types';

/**
 * Interface for the stress monitoring state
 */
export interface StressMonitoringState {
  // The last recorded stress analysis result
  lastStressResult: StressAnalysisResult | null;
  // Timestamp of the last stress test (different from the analysis timestamp as it records when the test was initiated)
  lastTestTimestamp: number | null;
  // History of stress readings
  stressHistory: Array<{
    stressLevel: number;
    timestamp: number;
    dominantExpression: string;
  }>;
  // Configuration options
  config: {
    // Interval in minutes between stress tests
    testInterval: number;
    // Maximum number of history items to keep
    maxHistoryItems: number;
    // Whether to automatically test stress levels periodically
    autoTestEnabled: boolean;
    // Manual stress mode for testing and demonstration
    isManualStressModeEnabled: boolean;
  };
}

/**
 * Initial state for the stress monitoring slice
 */
const initialState: StressMonitoringState = {
  lastStressResult: null,
  lastTestTimestamp: null,
  stressHistory: [],
  config: {
    testInterval: 30, // Default to 30 minutes
    maxHistoryItems: 100, // Store up to 100 history items
    autoTestEnabled: true, // Enabled by default
    isManualStressModeEnabled: false, // Disabled by default
  },
};

/**
 * Redux slice for stress monitoring
 */
export const stressMonitoringSlice = createSlice({
  name: 'stressMonitoring',
  initialState,
  reducers: {
    // Record a new stress test result
    recordStressResult: (state, action: PayloadAction<StressAnalysisResult>) => {
      const result = action.payload;

      // Update the last result
      state.lastStressResult = result;
      state.lastTestTimestamp = Date.now();

      // Add to history, keeping only the most recent items based on config
      state.stressHistory.unshift({
        stressLevel: result.stressLevel,
        // Check if timestamp is already a number or needs to be converted
        timestamp:
          typeof result.timestamp === 'number'
            ? result.timestamp
            : result.timestamp instanceof Date
              ? result.timestamp.getTime()
              : Date.now(),
        dominantExpression: result.dominantExpression,
      });

      // Maintain maximum history size
      if (state.stressHistory.length > state.config.maxHistoryItems) {
        state.stressHistory = state.stressHistory.slice(0, state.config.maxHistoryItems);
      }
    },

    // Update the test interval
    setTestInterval: (state, action: PayloadAction<number>) => {
      state.config.testInterval = action.payload;
    },

    // Enable or disable automatic stress testing
    setAutoTestEnabled: (state, action: PayloadAction<boolean>) => {
      state.config.autoTestEnabled = action.payload;
    },

    // Enable or disable manual stress mode
    setManualStressModeEnabled: (state, action: PayloadAction<boolean>) => {
      state.config.isManualStressModeEnabled = action.payload;
    },

    // Clear stress history
    clearStressHistory: (state) => {
      state.stressHistory = [];
    },
  },
});

// Export actions
export const {
  recordStressResult,
  setTestInterval,
  setAutoTestEnabled,
  setManualStressModeEnabled,
  clearStressHistory,
} = stressMonitoringSlice.actions;

// Export selectors
export const selectLastStressResult = (state: RootState) => state.stressMonitoring.lastStressResult;
export const selectLastTestTimestamp = (state: RootState) => state.stressMonitoring.lastTestTimestamp;
export const selectStressHistory = (state: RootState) => state.stressMonitoring.stressHistory;
export const selectTestInterval = (state: RootState) => state.stressMonitoring.config.testInterval;
export const selectAutoTestEnabled = (state: RootState) => state.stressMonitoring.config.autoTestEnabled;
export const selectManualStressModeEnabled = (state: RootState) =>
  state.stressMonitoring.config.isManualStressModeEnabled;

// Export reducer
export default stressMonitoringSlice.reducer;
