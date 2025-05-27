/**
 * Service for scheduling and managing periodic stress tests
 */

import { store } from '../store';
import {
  selectLastTestTimestamp,
  selectTestInterval,
  selectAutoTestEnabled,
  recordStressResult,
} from '../store/slices/stressMonitoringSlice';
import type { StressAnalysisResult } from '../modules/stress-detector/infrastructure/types/FaceExpressions.types';

// Create a single instance to ensure we don't have multiple timers
class StressMonitoringService {
  private timerId: number | null = null;

  /**
   * Initialize the stress monitoring service
   * This should be called when the app starts
   */
  public initialize(): void {
    console.log('Initializing stress monitoring service');
    this.scheduleNextTest();

    // Listen for store changes that might affect our scheduling
    store.subscribe(() => {
      const state = store.getState();
      const autoTestEnabled = selectAutoTestEnabled(state);

      // If auto testing was disabled, clear the timer
      if (!autoTestEnabled && this.timerId !== null) {
        this.clearScheduledTest();
      }
      // If auto testing was enabled and we don't have a timer, schedule a test
      else if (autoTestEnabled && this.timerId === null) {
        this.scheduleNextTest();
      }
      // Otherwise, keep the current timer
    });
  }

  /**
   * Schedule the next stress test based on the configured interval
   */
  public scheduleNextTest(): void {
    // Clear any existing timer
    this.clearScheduledTest();

    const state = store.getState();
    const autoTestEnabled = selectAutoTestEnabled(state);

    // Don't schedule if auto testing is disabled
    if (!autoTestEnabled) {
      console.log('Auto stress testing is disabled');
      return;
    }

    const lastTestTimestamp = selectLastTestTimestamp(state);
    const testIntervalMinutes = selectTestInterval(state);
    const testIntervalMs = testIntervalMinutes * 60 * 1000;

    // Calculate when the next test should run
    const now = Date.now();
    let nextTestTime: number;

    if (lastTestTimestamp === null) {
      // If no test has been run, schedule one immediately
      nextTestTime = now;
    } else {
      // Calculate when the next test should be based on the last test and interval
      nextTestTime = lastTestTimestamp + testIntervalMs;

      // If the next test time is in the past, schedule it immediately
      if (nextTestTime <= now) {
        nextTestTime = now;
      }
    }

    // Calculate delay in ms
    const delayMs = Math.max(0, nextTestTime - now);

    // Schedule the test
    console.log(`Scheduling next stress test in ${delayMs / 1000} seconds (${delayMs / (60 * 1000)} minutes)`);
    this.timerId = window.setTimeout(this.triggerStressTest.bind(this), delayMs);
  }

  /**
   * Trigger a stress test now
   * This will display the Face Analysis component for the user to complete a stress test
   */
  public triggerStressTest(): void {
    // Clear any existing timer since we're running now
    this.clearScheduledTest();

    console.log('Triggering stress test');

    // Dispatch an event to notify the app that a stress test should be shown
    const event = new CustomEvent('triggerStressTest');
    window.dispatchEvent(event);
  }
  /**
   * Record the result of a stress test
   * @param result The stress analysis result
   */ public recordTestResult(result: StressAnalysisResult): void {
    // Convert the FaceExpressions object to a plain object to make it serializable
    // Only dispatch if expressions is present (not null)
    if (result.expressions) {
      const serializedResult: StressAnalysisResult = {
        ...result,
        expressions: Object.fromEntries(
          Object.entries(result.expressions).map(([key, value]) => [key, Number(value)]),
        ) as typeof result.expressions,
        // Ensure timestamp is always a NUMBER, not a Date object for serialization
        timestamp:
          result.timestamp instanceof Date
            ? result.timestamp.getTime()
            : typeof result.timestamp === 'number'
              ? result.timestamp
              : Date.now(),
      };
      store.dispatch(recordStressResult(serializedResult));
    } else {
      // Optionally handle the case where expressions is null, or skip dispatch
      console.warn('Stress test result not recorded: expressions is null');
    }

    // Schedule the next test
    this.scheduleNextTest();
  }

  /**
   * Clear any scheduled stress test
   */
  private clearScheduledTest(): void {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

// Export a singleton instance
export const stressMonitoringService = new StressMonitoringService();
