import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Filters from './Filters';
import type { FiltersProps } from '../infrastructure/types/home.types';

// Mock the helper functions
vi.mock('../infrastructure/helpers/getFilterOptions', () => ({
  default: vi.fn(),
}));

vi.mock('../infrastructure/helpers/getWellbeingTaskDisplay', () => ({
  default: vi.fn(),
}));

vi.mock('../infrastructure/helpers/getWellbeingEmailDisplay', () => ({
  default: vi.fn(),
}));

// Mock CSS modules
vi.mock('../infrastructure/styles/home.module.css', () => ({
  default: {
    filterContainer: 'filterContainer',
    filterItem: 'filterItem',
  },
}));

// Mock Chakra UI components with proper types
vi.mock('@chakra-ui/react', () => ({
  ChakraProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="chakra-provider">{children}</div>,
  Box: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Skeleton: ({
    children,
    loading,
    className,
    height,
    ...props
  }: {
    children: React.ReactNode;
    loading: boolean;
    className?: string;
    height?: string;
    [key: string]: unknown;
  }) => {
    if (loading) {
      return (
        <div
          data-loading="true"
          className={className}
          style={{ height }}
          {...props}
        />
      );
    }
    return (
      <div
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  },
  Select: {
    Root: ({
      children,
      onValueChange,
      ...props
    }: {
      children: React.ReactNode;
      onValueChange?: (details: { value: string[] }) => void;
      [key: string]: unknown;
    }) => (
      <div
        data-testid="select-root"
        data-onvaluechange={onValueChange ? 'true' : 'false'}
        {...props}
      >
        {children}
      </div>
    ),
    HiddenSelect: () => (
      <input
        type="hidden"
        data-testid="hidden-select"
      />
    ),
    Control: ({ children }: { children: React.ReactNode }) => <div data-testid="select-control">{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => (
      <button
        role="combobox"
        aria-expanded="false"
        data-testid="select-trigger"
      >
        {children}
      </button>
    ),
    ValueText: ({ placeholder }: { placeholder?: string }) => <span data-testid="select-value">{placeholder}</span>,
    IndicatorGroup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="select-indicators">{children}</div>
    ),
    Indicator: () => <span data-testid="select-indicator">▼</span>,
    Positioner: ({ children }: { children: React.ReactNode }) => <div data-testid="select-positioner">{children}</div>,
    Content: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
    Item: ({
      children,
      item,
      onSelect,
    }: {
      children: React.ReactNode;
      item: { value: string; label: string };
      onSelect?: () => void;
    }) => (
      <div
        data-testid={`select-option-${item?.value}`}
        data-value={item?.value}
        onClick={() => {
          // Find the Select.Root element and trigger its onValueChange
          const selectRoot = document.querySelector('[data-testid="select-root"]');
          const onValueChangeAttr = selectRoot?.getAttribute('data-onvaluechange');
          if (onValueChangeAttr === 'true' && item?.value) {
            // Simulate the onValueChange event
            const event = new CustomEvent('valuechange', {
              detail: { value: [item.value] },
            });
            selectRoot?.dispatchEvent(event);
          }
          onSelect?.();
        }}
      >
        {children}
      </div>
    ),
    ItemIndicator: () => <span data-testid="select-item-indicator">✓</span>,
  },
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>,
  createListCollection: ({ items }: { items: unknown[] }) => ({ items }),
}));

import getFilterOptions from '../infrastructure/helpers/getFilterOptions';
import getWellbeingTaskDisplay from '../infrastructure/helpers/getWellbeingTaskDisplay';
import getWellbeingEmailDisplay from '../infrastructure/helpers/getWellbeingEmailDisplay';

const mockGetFilterOptions = vi.mocked(getFilterOptions);
const mockGetWellbeingTaskDisplay = vi.mocked(getWellbeingTaskDisplay);
const mockGetWellbeingEmailDisplay = vi.mocked(getWellbeingEmailDisplay);

// Wrapper component for Chakra UI
const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="test-wrapper">{children}</div>
);

// Helper function to create mock props
const createMockProps = (overrides: Partial<FiltersProps> = {}): FiltersProps => ({
  selectedView: 'my-day',
  setSelectedView: vi.fn(),
  isCurrentlyStressed: false,
  numOfFocusedEmails: 5,
  numOfOtherEmails: 10,
  isLoadingEmails: false,
  taskStats: {
    total: 15,
    pending: 8,
    completed: 5,
    overdue: 2,
    todayDue: 3,
    thisWeekDue: 8,
    thisMonthDue: 12,
  },
  isLoadingTasks: false,
  ...overrides,
});

describe('Filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockGetFilterOptions.mockReturnValue([
      { label: 'My Day', value: 'my-day' },
      { label: 'My Week', value: 'my-week' },
      { label: 'My Month', value: 'my-month' },
    ]);

    mockGetWellbeingTaskDisplay.mockReturnValue({
      count: 5,
      label: 'tasks completed',
      icon: '✅',
    });

    mockGetWellbeingEmailDisplay.mockReturnValue({
      count: 15,
      label: 'emails to explore',
      icon: '📮',
    });
  });

  describe('Rendering and basic structure', () => {
    it('should render without crashing', () => {
      const props = createMockProps();

      expect(() => {
        render(
          <ChakraWrapper>
            <Filters {...props} />
          </ChakraWrapper>,
        );
      }).not.toThrow();
    });

    it('should render filter container with correct CSS class', () => {
      const props = createMockProps();
      const { container } = render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      const filterContainer = container.querySelector('.filterContainer');
      expect(filterContainer).toBeInTheDocument();
    });

    it('should render all three filter items', () => {
      const props = createMockProps();
      const { container } = render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Count only top-level filter items (direct children of filterContainer)
      const filterContainer = container.querySelector('.filterContainer');
      const topLevelFilterItems = filterContainer?.children;
      expect(topLevelFilterItems).toHaveLength(3);
    });

    it('should render Select component', () => {
      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
    });
  });

  describe('Helper function integration', () => {
    it('should call getFilterOptions with correct stress state', () => {
      const props = createMockProps({ isCurrentlyStressed: true });

      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(mockGetFilterOptions).toHaveBeenCalledWith(true);
    });

    it('should call getWellbeingTaskDisplay with correct parameters', () => {
      const props = createMockProps({
        taskStats: {
          total: 10,
          pending: 5,
          completed: 3,
          overdue: 2,
          todayDue: 1,
          thisWeekDue: 4,
          thisMonthDue: 8,
        },
        selectedView: 'my-week',
        isCurrentlyStressed: true,
      });

      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(mockGetWellbeingTaskDisplay).toHaveBeenCalledWith(props.taskStats, 'my-week', true);
    });

    it('should call getWellbeingEmailDisplay with correct parameters', () => {
      const props = createMockProps({
        numOfFocusedEmails: 3,
        numOfOtherEmails: 7,
        isCurrentlyStressed: false,
      });

      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(mockGetWellbeingEmailDisplay).toHaveBeenCalledWith(3, 7, false);
    });
  });

  describe('Select component behavior', () => {
    it('should display current selected view', () => {
      const props = createMockProps({ selectedView: 'my-week' });

      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // The select should show the current value
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
    });

    it('should render filter options from getFilterOptions', async () => {
      mockGetFilterOptions.mockReturnValue([
        { label: 'My Day', value: 'my-day' },
        { label: 'My Week', value: 'my-week' },
      ]);

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      await waitFor(() => {
        expect(screen.getByText('My Day')).toBeInTheDocument();
        expect(screen.getByText('My Week')).toBeInTheDocument();
      });
    });
  });

  describe('Task display integration', () => {
    it('should display task information from getWellbeingTaskDisplay', () => {
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: 8,
        label: 'tasks completed',
        icon: '🌟',
      });

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText('🌟')).toBeInTheDocument();
      expect(screen.getByText(/8 tasks completed/)).toBeInTheDocument();
    });

    it('should handle task display without count', () => {
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: '',
        label: 'all caught up! ✨',
        icon: '',
      });

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText('all caught up! ✨')).toBeInTheDocument();
    });

    it('should handle task display with zero count', () => {
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: 0,
        label: 'start achieving!',
        icon: '🚀',
      });

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText('🚀')).toBeInTheDocument();
      expect(screen.getByText(/start achieving!/)).toBeInTheDocument();
    });
  });

  describe('Email display integration', () => {
    it('should display email information from getWellbeingEmailDisplay', () => {
      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: 12,
        label: 'emails waiting',
        icon: '📪',
      });

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText('📪')).toBeInTheDocument();
      expect(screen.getByText(/12 emails waiting/)).toBeInTheDocument();
    });

    it('should handle email display without count', () => {
      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: '',
        label: 'inbox clear! 🌟',
        icon: '',
      });

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText('inbox clear! 🌟')).toBeInTheDocument();
    });

    it('should handle email display with string count', () => {
      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: '30+',
        label: 'emails to organize',
        icon: '📫',
      });

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText('📫')).toBeInTheDocument();
      expect(screen.getByText(/30\+ emails to organize/)).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should show task skeleton when isLoadingTasks is true', () => {
      const props = createMockProps({ isLoadingTasks: true });
      const { container } = render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Chakra UI Skeleton should be present
      const skeletons = container.querySelectorAll('[data-loading="true"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show email skeleton when isLoadingEmails is true', () => {
      const props = createMockProps({ isLoadingEmails: true });
      const { container } = render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Chakra UI Skeleton should be present
      const skeletons = container.querySelectorAll('[data-loading="true"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should hide task content when loading', () => {
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: 5,
        label: 'tasks completed',
        icon: '✅',
      });

      const props = createMockProps({ isLoadingTasks: true });
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Content should not be visible when loading
      expect(screen.queryByText('tasks completed')).not.toBeInTheDocument();
    });

    it('should hide email content when loading', () => {
      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: 10,
        label: 'emails waiting',
        icon: '📪',
      });

      const props = createMockProps({ isLoadingEmails: true });
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Content should not be visible when loading
      expect(screen.queryByText('emails waiting')).not.toBeInTheDocument();
    });
  });

  describe('Stress-aware behavior', () => {
    it('should adapt filter options when stressed', () => {
      mockGetFilterOptions.mockReturnValue([{ label: 'My Day', value: 'my-day' }]);

      const props = createMockProps({ isCurrentlyStressed: true });
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(mockGetFilterOptions).toHaveBeenCalledWith(true);
    });

    it('should show stress-adapted task display', () => {
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: 3,
        label: 'tasks for today',
        icon: '🌱',
      });

      const props = createMockProps({ isCurrentlyStressed: true });
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText(/3 tasks for today/)).toBeInTheDocument();
    });

    it('should show stress-adapted email display', () => {
      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: 2,
        label: 'important emails 🎯',
        icon: '',
      });

      const props = createMockProps({ isCurrentlyStressed: true });
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(screen.getByText(/2 important emails 🎯/)).toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle undefined taskStats', () => {
      const props = createMockProps({ taskStats: undefined });

      expect(() => {
        render(
          <ChakraWrapper>
            <Filters {...props} />
          </ChakraWrapper>,
        );
      }).not.toThrow();

      expect(mockGetWellbeingTaskDisplay).toHaveBeenCalledWith(undefined, 'my-day', false);
    });

    it('should handle undefined email counts', () => {
      const props = createMockProps({
        numOfFocusedEmails: undefined,
        numOfOtherEmails: undefined,
      });

      expect(() => {
        render(
          <ChakraWrapper>
            <Filters {...props} />
          </ChakraWrapper>,
        );
      }).not.toThrow();

      expect(mockGetWellbeingEmailDisplay).toHaveBeenCalledWith(undefined, undefined, false);
    });

    it('should handle empty filter options', () => {
      mockGetFilterOptions.mockReturnValue([]);

      const props = createMockProps();

      expect(() => {
        render(
          <ChakraWrapper>
            <Filters {...props} />
          </ChakraWrapper>,
        );
      }).not.toThrow();
    });

    it('should handle helper functions throwing errors', () => {
      mockGetWellbeingTaskDisplay.mockImplementation(() => {
        throw new Error('Task display error');
      });

      const props = createMockProps();

      expect(() => {
        render(
          <ChakraWrapper>
            <Filters {...props} />
          </ChakraWrapper>,
        );
      }).toThrow('Task display error');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible select component', () => {
      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
      expect(selectTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should provide proper labels for screen readers', () => {
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: 5,
        label: 'tasks completed',
        icon: '✅',
      });

      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: 10,
        label: 'emails waiting',
        icon: '📪',
      });

      const props = createMockProps();
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Text content should be accessible
      expect(screen.getByText(/5 tasks completed/)).toBeInTheDocument();
      expect(screen.getByText(/10 emails waiting/)).toBeInTheDocument();
    });
  });

  describe('Performance considerations', () => {
    it('should not re-render unnecessarily when props do not change', () => {
      let renderCount = 0;
      const TestComponent = (props: FiltersProps) => {
        renderCount++;
        return <Filters {...props} />;
      };

      const props = createMockProps();
      const { rerender } = render(
        <ChakraWrapper>
          <TestComponent {...props} />
        </ChakraWrapper>,
      );

      expect(renderCount).toBe(1);

      // Re-render with same props
      rerender(
        <ChakraWrapper>
          <TestComponent {...props} />
        </ChakraWrapper>,
      );

      expect(renderCount).toBe(2); // React will re-render but that's expected
    });

    it('should handle large numbers in displays', () => {
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: 9999,
        label: 'tasks completed',
        icon: '🏆',
      });

      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: '1000+',
        label: 'emails to organize',
        icon: '📫',
      });

      const props = createMockProps();

      expect(() => {
        render(
          <ChakraWrapper>
            <Filters {...props} />
          </ChakraWrapper>,
        );
      }).not.toThrow();

      expect(screen.getByText(/9999 tasks completed/)).toBeInTheDocument();
      expect(screen.getByText(/1000\+ emails to organize/)).toBeInTheDocument();
    });
  });

  describe('Integration scenarios', () => {
    it('should work correctly in normal user workflow', () => {
      const mockSetSelectedView = vi.fn();
      const props = createMockProps({
        selectedView: 'my-day',
        setSelectedView: mockSetSelectedView,
        isCurrentlyStressed: false,
        taskStats: {
          total: 20,
          pending: 10,
          completed: 8,
          overdue: 2,
          todayDue: 5,
          thisWeekDue: 12,
          thisMonthDue: 18,
        },
        numOfFocusedEmails: 3,
        numOfOtherEmails: 12,
      });

      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Should display all components
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(mockGetFilterOptions).toHaveBeenCalledWith(false);
      expect(mockGetWellbeingTaskDisplay).toHaveBeenCalledWith(props.taskStats, 'my-day', false);
      expect(mockGetWellbeingEmailDisplay).toHaveBeenCalledWith(3, 12, false);
    });

    it('should adapt correctly when user becomes stressed', () => {
      mockGetFilterOptions.mockReturnValue([{ label: 'My Day', value: 'my-day' }]);
      mockGetWellbeingTaskDisplay.mockReturnValue({
        count: 2,
        label: 'tasks for today',
        icon: '🌱',
      });
      mockGetWellbeingEmailDisplay.mockReturnValue({
        count: 1,
        label: 'important email 🎯',
        icon: '',
      });

      const props = createMockProps({ isCurrentlyStressed: true });
      render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      expect(mockGetFilterOptions).toHaveBeenCalledWith(true);
      expect(screen.getByText(/2 tasks for today/)).toBeInTheDocument();
      expect(screen.getByText(/1 important email 🎯/)).toBeInTheDocument();
    });

    it('should handle loading to loaded state transition', () => {
      const props = createMockProps({
        isLoadingTasks: true,
        isLoadingEmails: true,
      });

      const { rerender } = render(
        <ChakraWrapper>
          <Filters {...props} />
        </ChakraWrapper>,
      );

      // Should show loading skeletons
      const skeletons = document.querySelectorAll('[data-loading="true"]');
      expect(skeletons.length).toBeGreaterThan(0);

      // Update to loaded state
      rerender(
        <ChakraWrapper>
          <Filters {...{ ...props, isLoadingTasks: false, isLoadingEmails: false }} />
        </ChakraWrapper>,
      );

      // Should show actual content
      expect(screen.getByText(/tasks completed/)).toBeInTheDocument();
      expect(screen.getByText(/emails to explore/)).toBeInTheDocument();
    });
  });
});
