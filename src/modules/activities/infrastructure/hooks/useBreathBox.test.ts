import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useBreathBox } from './useBreathBox';

// Mock the constants
vi.mock('../constants/constants', () => ({
  PHASE_DURATION: 4000, // 4 seconds in milliseconds
  PHASE_LABELS: {
    inhale: 'Breathe In',
    hold1: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold',
  },
}));

describe('useBreathBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  describe('Initial state', () => {
    it('should return initial state with breathing inactive', () => {
      const { result } = renderHook(() => useBreathBox());

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.progress).toBe(0);
      expect(result.current.cycleCount).toBe(0);
      expect(result.current.timeRemaining).toBe(4);
    });

    it('should provide all required handler functions', () => {
      const { result } = renderHook(() => useBreathBox());

      expect(typeof result.current.handleStart).toBe('function');
      expect(typeof result.current.handlePause).toBe('function');
      expect(typeof result.current.handleStop).toBe('function');
      expect(typeof result.current.getCurrentPhaseLabel).toBe('function');
    });

    it('should provide phase labels constant', () => {
      const { result } = renderHook(() => useBreathBox());

      expect(result.current.phaseLabels).toEqual({
        inhale: 'Breathe In',
        hold1: 'Hold',
        exhale: 'Breathe Out',
        hold2: 'Hold',
      });
    });

    it('should return correct initial phase label', () => {
      const { result } = renderHook(() => useBreathBox());

      expect(result.current.getCurrentPhaseLabel()).toBe('Breathe In');
    });
  });

  describe('Starting and stopping breathing', () => {
    it('should activate breathing when handleStart is called', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should deactivate breathing when handlePause is called', () => {
      const { result } = renderHook(() => useBreathBox());

      // Start breathing first
      act(() => {
        result.current.handleStart();
      });

      expect(result.current.isActive).toBe(true);

      // Then pause
      act(() => {
        result.current.handlePause();
      });

      expect(result.current.isActive).toBe(false);
    });

    it('should reset all state when handleStop is called', () => {
      const { result } = renderHook(() => useBreathBox());

      // Start breathing and advance some progress
      act(() => {
        result.current.handleStart();
      });

      act(() => {
        vi.advanceTimersByTime(2000); // 2 seconds
      });

      // Stop breathing
      act(() => {
        result.current.handleStop();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.progress).toBe(0);
      expect(result.current.cycleCount).toBe(0);
      expect(result.current.timeRemaining).toBe(4);
    });

    it('should handle stop when not active', () => {
      const { result } = renderHook(() => useBreathBox());

      // Stop without starting
      act(() => {
        result.current.handleStop();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.progress).toBe(0);
      expect(result.current.cycleCount).toBe(0);
      expect(result.current.timeRemaining).toBe(4);
    });
  });

  describe('Phase progression', () => {
    it('should progress through all phases in correct order', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // Should start with inhale
      expect(result.current.currentPhase).toBe('inhale');

      // Advance to next phase (hold1)
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.currentPhase).toBe('hold1');

      // Advance to next phase (exhale)
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.currentPhase).toBe('exhale');

      // Advance to next phase (hold2)
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.currentPhase).toBe('hold2');

      // Advance to next phase (back to inhale)
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.currentPhase).toBe('inhale');
    });

    it('should increment cycle count when returning to inhale phase', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      expect(result.current.cycleCount).toBe(0);
      expect(result.current.currentPhase).toBe('inhale');

      // Go through each phase and check
      // Phase 1: inhale (0s) -> hold1 (4s)
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(result.current.currentPhase).toBe('hold1');
      expect(result.current.cycleCount).toBe(0);

      // Phase 2: hold1 (4s) -> exhale (8s)
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(result.current.currentPhase).toBe('exhale');
      expect(result.current.cycleCount).toBe(0);

      // Phase 3: exhale (8s) -> hold2 (12s)
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(result.current.currentPhase).toBe('hold2');
      expect(result.current.cycleCount).toBe(0);

      // Phase 4: hold2 (12s) -> inhale (16s) - this should increment cycle count
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.cycleCount).toBe(1);

      // Complete another cycle (4 phases of 4 seconds each)
      act(() => {
        vi.advanceTimersByTime(4000); // hold1
      });
      expect(result.current.currentPhase).toBe('hold1');

      act(() => {
        vi.advanceTimersByTime(4000); // exhale
      });
      expect(result.current.currentPhase).toBe('exhale');

      act(() => {
        vi.advanceTimersByTime(4000); // hold2
      });
      expect(result.current.currentPhase).toBe('hold2');

      act(() => {
        vi.advanceTimersByTime(4000); // back to inhale
      });
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.cycleCount).toBe(2);
    });

    it('should update progress and time remaining correctly', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // At 1 second: 25% progress, 3 seconds remaining
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.progress).toBe(25);
      expect(result.current.timeRemaining).toBe(3);

      // At 2 seconds: 50% progress, 2 seconds remaining
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.progress).toBe(50);
      expect(result.current.timeRemaining).toBe(2);

      // At 3 seconds: 75% progress, 1 second remaining
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.progress).toBe(75);
      expect(result.current.timeRemaining).toBe(1);

      // At 4 seconds: should transition to next phase
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.progress).toBe(0);
      expect(result.current.timeRemaining).toBe(4);
      expect(result.current.currentPhase).toBe('hold1');
    });
  });

  describe('Timer management', () => {
    it('should clear timer when paused', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // Advance some time
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const progressBeforePause = result.current.progress;

      // Pause
      act(() => {
        result.current.handlePause();
      });

      // Advance more time - progress shouldn't change
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.progress).toBe(progressBeforePause);
    });

    it('should resume from current state when restarted', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // Advance to middle of first phase
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Pause
      act(() => {
        result.current.handlePause();
      });

      const stateBeforeRestart = {
        currentPhase: result.current.currentPhase,
        cycleCount: result.current.cycleCount,
      };

      // Restart
      act(() => {
        result.current.handleStart();
      });

      // Should maintain previous state but reset progress
      expect(result.current.currentPhase).toBe(stateBeforeRestart.currentPhase);
      expect(result.current.cycleCount).toBe(stateBeforeRestart.cycleCount);
      expect(result.current.isActive).toBe(true);
    });

    it('should clean up timer on unmount', () => {
      const { result, unmount } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Phase labels', () => {
    it('should return correct labels for each phase', () => {
      const { result } = renderHook(() => useBreathBox());

      // Test each phase
      const phases = [
        { phase: 'inhale', expected: 'Breathe In' },
        { phase: 'hold1', expected: 'Hold' },
        { phase: 'exhale', expected: 'Breathe Out' },
        { phase: 'hold2', expected: 'Hold' },
      ];

      act(() => {
        result.current.handleStart();
      });

      phases.forEach(({ phase, expected }, index) => {
        // Advance to specific phase
        if (index > 0) {
          act(() => {
            vi.advanceTimersByTime(4000);
          });
        }

        expect(result.current.currentPhase).toBe(phase);
        expect(result.current.getCurrentPhaseLabel()).toBe(expected);
      });
    });

    it('should provide consistent phase labels object', () => {
      const { result, rerender } = renderHook(() => useBreathBox());

      const firstLabels = result.current.phaseLabels;
      rerender();
      const secondLabels = result.current.phaseLabels;

      expect(firstLabels).toEqual(secondLabels);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle rapid start/stop operations', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
        result.current.handlePause();
        result.current.handleStart();
        result.current.handleStop();
        result.current.handleStart();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.progress).toBe(0);
      expect(result.current.cycleCount).toBe(0);
    });

    it('should handle multiple consecutive stops', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
        result.current.handleStop();
        result.current.handleStop();
        result.current.handleStop();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.progress).toBe(0);
      expect(result.current.cycleCount).toBe(0);
    });

    it('should handle timer intervals correctly at phase boundaries', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // Advance exactly to phase boundary
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.currentPhase).toBe('hold1');
      expect(result.current.progress).toBe(0);
      expect(result.current.timeRemaining).toBe(4);

      // Advance slightly past boundary
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.currentPhase).toBe('hold1');
      expect(result.current.progress).toBe(2.5); // 100ms / 4000ms * 100
      expect(result.current.timeRemaining).toBe(4); // Rounds up
    });
  });

  describe('Performance and consistency', () => {
    it('should provide stable function references', () => {
      const { result, rerender } = renderHook(() => useBreathBox());

      const firstRenderHandlers = {
        handleStart: result.current.handleStart,
        handlePause: result.current.handlePause,
        handleStop: result.current.handleStop,
        getCurrentPhaseLabel: result.current.getCurrentPhaseLabel,
      };

      rerender();

      const secondRenderHandlers = {
        handleStart: result.current.handleStart,
        handlePause: result.current.handlePause,
        handleStop: result.current.handleStop,
        getCurrentPhaseLabel: result.current.getCurrentPhaseLabel,
      };

      // Functions should be stable across re-renders
      expect(firstRenderHandlers.handleStart).toBe(secondRenderHandlers.handleStart);
      expect(firstRenderHandlers.handlePause).toBe(secondRenderHandlers.handlePause);
      expect(firstRenderHandlers.handleStop).toBe(secondRenderHandlers.handleStop);
      expect(firstRenderHandlers.getCurrentPhaseLabel).toBe(secondRenderHandlers.getCurrentPhaseLabel);
    });

    it('should handle multiple cycles without memory leaks', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // Complete multiple cycles - need to advance time in individual phases
      for (let cycle = 0; cycle < 5; cycle++) {
        // Complete one full cycle (4 phases)
        for (let phase = 0; phase < 4; phase++) {
          act(() => {
            vi.advanceTimersByTime(4000); // One phase (4 seconds)
          });
        }
      }

      expect(result.current.cycleCount).toBe(5);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.isActive).toBe(true);
    });

    it('should maintain accuracy over long periods', () => {
      const { result } = renderHook(() => useBreathBox());

      act(() => {
        result.current.handleStart();
      });

      // Run for 10 complete cycles - need to advance time in phases
      for (let cycle = 0; cycle < 10; cycle++) {
        // Complete one full cycle (4 phases)
        for (let phase = 0; phase < 4; phase++) {
          act(() => {
            vi.advanceTimersByTime(4000); // One phase (4 seconds)
          });
        }
      }

      expect(result.current.cycleCount).toBe(10);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.progress).toBe(0);
      expect(result.current.timeRemaining).toBe(4);
    });
  });

  describe('Type safety and return structure', () => {
    it('should return all expected properties with correct types', () => {
      const { result } = renderHook(() => useBreathBox());

      // Verify all properties exist
      expect(result.current).toHaveProperty('isActive');
      expect(result.current).toHaveProperty('currentPhase');
      expect(result.current).toHaveProperty('progress');
      expect(result.current).toHaveProperty('cycleCount');
      expect(result.current).toHaveProperty('timeRemaining');
      expect(result.current).toHaveProperty('handleStart');
      expect(result.current).toHaveProperty('handlePause');
      expect(result.current).toHaveProperty('handleStop');
      expect(result.current).toHaveProperty('getCurrentPhaseLabel');
      expect(result.current).toHaveProperty('phaseLabels');

      // Verify types
      expect(typeof result.current.isActive).toBe('boolean');
      expect(typeof result.current.currentPhase).toBe('string');
      expect(typeof result.current.progress).toBe('number');
      expect(typeof result.current.cycleCount).toBe('number');
      expect(typeof result.current.timeRemaining).toBe('number');
      expect(typeof result.current.handleStart).toBe('function');
      expect(typeof result.current.handlePause).toBe('function');
      expect(typeof result.current.handleStop).toBe('function');
      expect(typeof result.current.getCurrentPhaseLabel).toBe('function');
      expect(typeof result.current.phaseLabels).toBe('object');
    });

    it('should maintain valid phase values', () => {
      const { result } = renderHook(() => useBreathBox());
      const validPhases = ['inhale', 'hold1', 'exhale', 'hold2'];

      act(() => {
        result.current.handleStart();
      });

      // Test multiple phase transitions
      for (let i = 0; i < 8; i++) {
        expect(validPhases).toContain(result.current.currentPhase);
        act(() => {
          vi.advanceTimersByTime(4000);
        });
      }
    });
  });

  describe('Integration scenarios', () => {
    it('should work correctly in a typical breathing session', () => {
      const { result } = renderHook(() => useBreathBox());

      // 1. Start breathing session
      act(() => {
        result.current.handleStart();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.currentPhase).toBe('inhale');

      // 2. Complete first cycle (advance through all 4 phases)
      for (let phase = 0; phase < 4; phase++) {
        act(() => {
          vi.advanceTimersByTime(4000);
        });
      }

      expect(result.current.cycleCount).toBe(1);
      expect(result.current.currentPhase).toBe('inhale');

      // 3. Pause mid-second cycle (advance through 2 phases to reach exhale)
      act(() => {
        vi.advanceTimersByTime(4000); // inhale -> hold1
      });
      act(() => {
        vi.advanceTimersByTime(4000); // hold1 -> exhale
      });

      expect(result.current.currentPhase).toBe('exhale');

      act(() => {
        result.current.handlePause();
      });

      expect(result.current.isActive).toBe(false);

      // 4. Resume and complete second cycle
      act(() => {
        result.current.handleStart();
      });

      // Complete remaining phases of second cycle (exhale -> hold2 -> inhale)
      act(() => {
        vi.advanceTimersByTime(4000); // exhale -> hold2
      });
      act(() => {
        vi.advanceTimersByTime(4000); // hold2 -> inhale (completes cycle 2)
      });

      expect(result.current.cycleCount).toBe(2);

      // 5. Stop session
      act(() => {
        result.current.handleStop();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentPhase).toBe('inhale');
      expect(result.current.cycleCount).toBe(0);
    });
  });
});
