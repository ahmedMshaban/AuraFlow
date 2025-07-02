import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useActivityLibrary } from './useActivityLibrary';

// Mock the constants
vi.mock('../constants/constants', () => ({
  ACTIVITIES_DATA: [
    {
      id: 'test-activity-1',
      title: 'Test Activity 1',
      description: 'Test description 1',
      iconKey: 'FaLungs',
      duration: '5 min',
      difficulty: 'Easy',
      category: 'breathing',
      componentKey: 'BreathBox',
    },
    {
      id: 'test-activity-2',
      title: 'Test Activity 2',
      description: 'Test description 2',
      iconKey: 'FaPalette',
      duration: '10 min',
      difficulty: 'Medium',
      category: 'creative',
      componentKey: 'DoodlingSpace',
    },
    {
      id: 'test-activity-3',
      title: 'Test Activity 3',
      description: 'Test description 3',
      iconKey: 'FaBrain',
      difficulty: 'Hard',
      category: 'mindfulness',
      componentKey: 'MeditationPlaceholder',
    },
  ],
  ACTIVITY_ICONS: {
    FaLungs: vi.fn(() => 'lungs-icon'),
    FaPalette: vi.fn(() => 'palette-icon'),
    FaBrain: vi.fn(() => 'brain-icon'),
  },
}));

describe('useActivityLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Initial state', () => {
    it('should return initial state with null selectedActivity and closed modal', () => {
      const { result } = renderHook(() => useActivityLibrary());

      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should return mapped activities with icons', () => {
      const { result } = renderHook(() => useActivityLibrary());

      expect(result.current.activities).toHaveLength(3);
      expect(result.current.activities[0]).toEqual({
        id: 'test-activity-1',
        title: 'Test Activity 1',
        description: 'Test description 1',
        iconKey: 'FaLungs',
        duration: '5 min',
        difficulty: 'Easy',
        category: 'breathing',
        componentKey: 'BreathBox',
        icon: expect.any(Function),
      });
    });

    it('should provide function references for actions', () => {
      const { result } = renderHook(() => useActivityLibrary());

      expect(typeof result.current.handleActivityClick).toBe('function');
      expect(typeof result.current.handleCloseModal).toBe('function');
    });
  });

  describe('Activity selection', () => {
    it('should set selected activity and open modal when handleActivityClick is called', () => {
      const { result } = renderHook(() => useActivityLibrary());
      const testActivity = result.current.activities[0];

      act(() => {
        result.current.handleActivityClick(testActivity);
      });

      expect(result.current.selectedActivity).toEqual(testActivity);
      expect(result.current.isModalOpen).toBe(true);
    });

    it('should handle different activities correctly', () => {
      const { result } = renderHook(() => useActivityLibrary());
      const firstActivity = result.current.activities[0];
      const secondActivity = result.current.activities[1];

      // Select first activity
      act(() => {
        result.current.handleActivityClick(firstActivity);
      });

      expect(result.current.selectedActivity).toEqual(firstActivity);
      expect(result.current.isModalOpen).toBe(true);

      // Select second activity
      act(() => {
        result.current.handleActivityClick(secondActivity);
      });

      expect(result.current.selectedActivity).toEqual(secondActivity);
      expect(result.current.isModalOpen).toBe(true);
    });

    it('should maintain modal state when selecting different activities', () => {
      const { result } = renderHook(() => useActivityLibrary());
      const activities = result.current.activities;

      // Select first activity
      act(() => {
        result.current.handleActivityClick(activities[0]);
      });

      expect(result.current.isModalOpen).toBe(true);

      // Select second activity without closing modal
      act(() => {
        result.current.handleActivityClick(activities[1]);
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.selectedActivity).toEqual(activities[1]);
    });
  });

  describe('Modal management', () => {
    it('should close modal and clear selected activity when handleCloseModal is called', () => {
      const { result } = renderHook(() => useActivityLibrary());
      const testActivity = result.current.activities[0];

      // First select an activity
      act(() => {
        result.current.handleActivityClick(testActivity);
      });

      expect(result.current.selectedActivity).toEqual(testActivity);
      expect(result.current.isModalOpen).toBe(true);

      // Then close the modal
      act(() => {
        result.current.handleCloseModal();
      });

      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should handle closing modal when no activity is selected', () => {
      const { result } = renderHook(() => useActivityLibrary());

      // Close modal without selecting any activity
      act(() => {
        result.current.handleCloseModal();
      });

      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should handle multiple close operations gracefully', () => {
      const { result } = renderHook(() => useActivityLibrary());

      // Close modal multiple times
      act(() => {
        result.current.handleCloseModal();
        result.current.handleCloseModal();
        result.current.handleCloseModal();
      });

      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });
  });

  describe('Activities data integrity', () => {
    it('should preserve all original activity properties', () => {
      const { result } = renderHook(() => useActivityLibrary());

      result.current.activities.forEach((activity) => {
        expect(activity.id).toBeDefined();
        expect(activity.title).toBeDefined();
        expect(activity.description).toBeDefined();
        expect(activity.iconKey).toBeDefined();
        expect(activity.difficulty).toBeDefined();
        expect(activity.category).toBeDefined();
        expect(activity.componentKey).toBeDefined();
        expect(activity.icon).toBeDefined();
      });
    });

    it('should handle activities with optional duration', () => {
      const { result } = renderHook(() => useActivityLibrary());
      const activitiesWithDuration = result.current.activities.filter((a) => a.duration);
      const activitiesWithoutDuration = result.current.activities.filter((a) => !a.duration);

      expect(activitiesWithDuration.length).toBeGreaterThan(0);
      expect(activitiesWithoutDuration.length).toBeGreaterThan(0);
    });

    it('should maintain consistent activity structure across re-renders', () => {
      const { result, rerender } = renderHook(() => useActivityLibrary());

      const firstRenderActivities = result.current.activities;

      rerender();

      const secondRenderActivities = result.current.activities;

      expect(firstRenderActivities).toHaveLength(secondRenderActivities.length);
      firstRenderActivities.forEach((activity, index) => {
        expect(activity.id).toBe(secondRenderActivities[index].id);
        expect(activity.title).toBe(secondRenderActivities[index].title);
      });
    });
  });

  describe('Hook stability and performance', () => {
    it('should provide stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useActivityLibrary());

      const firstRenderHandlers = {
        handleActivityClick: result.current.handleActivityClick,
        handleCloseModal: result.current.handleCloseModal,
      };

      rerender();

      const secondRenderHandlers = {
        handleActivityClick: result.current.handleActivityClick,
        handleCloseModal: result.current.handleCloseModal,
      };

      // Functions should be the same reference due to useCallback or being defined outside renders
      expect(firstRenderHandlers.handleActivityClick).toBe(secondRenderHandlers.handleActivityClick);
      expect(firstRenderHandlers.handleCloseModal).toBe(secondRenderHandlers.handleCloseModal);
    });

    it('should not cause unnecessary re-renders when called multiple times', () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useActivityLibrary();
      });

      expect(renderCount).toBe(1);

      // These should not cause re-renders since they don't change state in a meaningful way
      const activity = result.current.activities[0];

      act(() => {
        result.current.handleActivityClick(activity);
      });

      expect(renderCount).toBe(2); // One re-render for state change

      act(() => {
        result.current.handleCloseModal();
      });

      expect(renderCount).toBe(3); // One more re-render for state change
    });

    it('should handle rapid state changes correctly', () => {
      const { result } = renderHook(() => useActivityLibrary());
      const activities = result.current.activities;

      act(() => {
        // Rapid sequential operations
        result.current.handleActivityClick(activities[0]);
        result.current.handleCloseModal();
        result.current.handleActivityClick(activities[1]);
        result.current.handleActivityClick(activities[2]);
        result.current.handleCloseModal();
      });

      // Final state should be closed
      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty activities array gracefully', () => {
      vi.doMock('../constants/constants', () => ({
        ACTIVITIES_DATA: [],
        ACTIVITY_ICONS: {},
      }));

      const { result } = renderHook(() => useActivityLibrary());

      expect(result.current.activities).toHaveLength(0);
      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should handle activities with missing icon keys', () => {
      vi.doMock('../constants/constants', () => ({
        ACTIVITIES_DATA: [
          {
            id: 'test-activity',
            title: 'Test Activity',
            description: 'Test description',
            iconKey: 'NonExistentIcon',
            difficulty: 'Easy',
            category: 'test',
            componentKey: 'TestComponent',
          },
        ],
        ACTIVITY_ICONS: {},
      }));

      const { result } = renderHook(() => useActivityLibrary());

      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0].icon).toBeUndefined();
    });
  });

  describe('Type safety', () => {
    it('should handle activity clicks with correct typing', () => {
      const { result } = renderHook(() => useActivityLibrary());
      const activity = result.current.activities[0];

      // This should not throw TypeScript errors
      act(() => {
        result.current.handleActivityClick(activity);
      });

      expect(result.current.selectedActivity).toEqual(activity);
    });

    it('should maintain proper return type structure', () => {
      const { result } = renderHook(() => useActivityLibrary());

      // Verify return type has all expected properties
      expect(result.current).toHaveProperty('activities');
      expect(result.current).toHaveProperty('selectedActivity');
      expect(result.current).toHaveProperty('isModalOpen');
      expect(result.current).toHaveProperty('handleActivityClick');
      expect(result.current).toHaveProperty('handleCloseModal');

      // Verify types
      expect(Array.isArray(result.current.activities)).toBe(true);
      expect(typeof result.current.isModalOpen).toBe('boolean');
      expect(typeof result.current.handleActivityClick).toBe('function');
      expect(typeof result.current.handleCloseModal).toBe('function');
    });
  });

  describe('Integration scenarios', () => {
    it('should work correctly in a typical user flow', () => {
      const { result } = renderHook(() => useActivityLibrary());

      // 1. Initial state - no activity selected, modal closed
      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);

      // 2. User clicks on first activity
      const firstActivity = result.current.activities[0];
      act(() => {
        result.current.handleActivityClick(firstActivity);
      });

      expect(result.current.selectedActivity).toEqual(firstActivity);
      expect(result.current.isModalOpen).toBe(true);

      // 3. User clicks on different activity (switching)
      const secondActivity = result.current.activities[1];
      act(() => {
        result.current.handleActivityClick(secondActivity);
      });

      expect(result.current.selectedActivity).toEqual(secondActivity);
      expect(result.current.isModalOpen).toBe(true);

      // 4. User closes modal
      act(() => {
        result.current.handleCloseModal();
      });

      expect(result.current.selectedActivity).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });
  });
});
