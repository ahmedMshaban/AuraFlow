/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Tasks from './Tasks';
import type { Task, TasksProps, TaskStats } from '@/shared/types/task.types';
import type { ReactNode } from 'react';

// Mock child components
vi.mock('./TaskForm', () => ({
  default: ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: unknown) => void;
    isLoading: boolean;
  }) =>
    isOpen ? (
      <div data-testid="task-form">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSubmit({ title: 'Test Task', dueDate: new Date(), priority: 'medium' })}>
          Submit Task
        </button>
        {isLoading && <span>Creating...</span>}
      </div>
    ) : null,
}));

vi.mock('./TaskItem', () => ({
  default: ({
    task,
    onToggleStatus,
    onDelete,
  }: {
    task: { id: string; title: string; status: string };
    onToggleStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid={`task-item-${task.id}`}>
      <span>{task.title}</span>
      <button onClick={() => onToggleStatus(task.id, task.status)}>Toggle Status</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  ),
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Button: ({
    children,
    onClick,
    size,
    variant,
    colorScheme,
    ml,
    title,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    size?: string;
    variant?: string;
    colorScheme?: string;
    ml?: string;
    title?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      data-size={size}
      data-variant={variant}
      data-colorscheme={colorScheme}
      data-ml={ml}
      title={title}
      {...props}
    >
      {children}
    </button>
  ),
  VStack: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="vstack"
      {...props}
    >
      {children}
    </div>
  ),
  HStack: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="hstack"
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <span {...props}>{children}</span>,
  Spinner: ({ size, color }: { size?: string; color?: string }) => (
    <div
      data-testid="spinner"
      data-size={size}
      data-color={color}
    />
  ),
}));

// Mock the helper function
vi.mock('../../infrastructure/helpers/getTasksTabsForMode', () => ({
  default: (
    upcomingTasks: Task[],
    overdueTasks: Task[],
    completedTasks: Task[],
    taskStats: TaskStats,
    isCurrentlyStressed: boolean,
  ) => {
    if (isCurrentlyStressed) {
      // Stress mode: only priority tab
      const priorityTasks = [...overdueTasks, ...upcomingTasks.filter((task) => task.priority === 'high')];
      return [
        {
          key: 'priority',
          label: 'Priority',
          count: priorityTasks.length,
          tasks: priorityTasks,
          color: 'orange',
          description: 'Focus on what matters most',
        },
      ];
    } else {
      // Normal mode: all tabs
      return [
        {
          key: 'upcoming',
          label: 'Upcoming',
          count: taskStats.pending,
          tasks: upcomingTasks,
          color: 'blue',
          description: 'Plan your future tasks',
        },
        {
          key: 'overdue',
          label: 'Overdue',
          count: taskStats.overdue,
          tasks: overdueTasks,
          color: 'red',
          description: 'Catch up on missed deadlines',
        },
        {
          key: 'completed',
          label: 'Completed',
          count: taskStats.completed,
          tasks: completedTasks,
          color: 'green',
          description: 'Celebrate your achievements',
        },
      ];
    }
  },
}));

describe('Tasks', () => {
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: `task-${Math.random()}`,
    title: 'Test Task',
    description: 'Test description',
    dueDate: new Date('2025-06-30'),
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2025-06-26'),
    updatedAt: new Date('2025-06-26'),
    userId: 'user-1',
    ...overrides,
  });

  const createMockTaskStats = (overrides: Partial<TaskStats> = {}): TaskStats => ({
    total: 10,
    pending: 5,
    completed: 3,
    overdue: 2,
    todayDue: 1,
    thisWeekDue: 3,
    thisMonthDue: 5,
    ...overrides,
  });

  const defaultProps: TasksProps = {
    upcomingTasks: [
      createMockTask({ id: 'upcoming-1', title: 'Upcoming Task 1' }),
      createMockTask({ id: 'upcoming-2', title: 'Upcoming Task 2', priority: 'high' }),
    ],
    overdueTasks: [createMockTask({ id: 'overdue-1', title: 'Overdue Task 1', status: 'overdue' })],
    completedTasks: [createMockTask({ id: 'completed-1', title: 'Completed Task 1', status: 'completed' })],
    taskStats: createMockTaskStats(),
    isLoading: false,
    error: null,
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTaskStatus: vi.fn(),
    isCreating: false,
    isCurrentlyStressed: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Loading and Error States', () => {
    it('displays loading state when isLoading is true', () => {
      render(
        <Tasks
          {...defaultProps}
          isLoading={true}
        />,
      );

      expect(screen.getByTestId('spinner')).toBeDefined();
      expect(screen.getByText('Loading your tasks...')).toBeDefined();
    });

    it('displays error state when error is provided', () => {
      const errorMessage = 'Failed to load tasks';
      render(
        <Tasks
          {...defaultProps}
          error={errorMessage}
        />,
      );

      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });

  describe('Normal Mode (Not Stressed)', () => {
    it('renders all tabs in normal mode', () => {
      render(<Tasks {...defaultProps} />);

      expect(screen.getByText('Upcoming (5)')).toBeDefined();
      expect(screen.getByText('Overdue (2)')).toBeDefined();
      expect(screen.getByText('Completed (3)')).toBeDefined();
      expect(screen.getByText('+ New Task')).toBeDefined();
    });

    it('displays upcoming tasks by default', () => {
      render(<Tasks {...defaultProps} />);

      expect(screen.getByTestId('task-item-upcoming-1')).toBeDefined();
      expect(screen.getByTestId('task-item-upcoming-2')).toBeDefined();
      expect(screen.getByText('Upcoming Task 1')).toBeDefined();
      expect(screen.getByText('Upcoming Task 2')).toBeDefined();
    });

    it('switches tabs when tab buttons are clicked', () => {
      render(<Tasks {...defaultProps} />);

      // Initially shows upcoming tasks
      expect(screen.getByTestId('task-item-upcoming-1')).toBeDefined();

      // Click overdue tab
      const overdueTab = screen.getByText('Overdue (2)');
      fireEvent.click(overdueTab);

      // Should now show overdue tasks
      expect(screen.getByTestId('task-item-overdue-1')).toBeDefined();
      expect(screen.getByText('Overdue Task 1')).toBeDefined();
    });

    it('shows empty state message when no tasks in current tab', () => {
      const propsWithNoUpcoming = {
        ...defaultProps,
        upcomingTasks: [],
        taskStats: createMockTaskStats({ pending: 0 }),
      };

      render(<Tasks {...propsWithNoUpcoming} />);

      expect(screen.getByText('No upcoming tasks')).toBeDefined();
    });
  });

  describe('Stress Mode', () => {
    it('shows stress mode helper text when stressed', () => {
      render(
        <Tasks
          {...defaultProps}
          isCurrentlyStressed={true}
        />,
      );

      expect(
        screen.getByText(/🧘‍♀️ Focus Mode: Showing overdue tasks \+ high-priority upcoming tasks only/),
      ).toBeDefined();
    });

    it('only shows priority tab in stress mode', () => {
      render(
        <Tasks
          {...defaultProps}
          isCurrentlyStressed={true}
        />,
      );

      // Should only show priority tab
      expect(screen.getByText('Priority (2)')).toBeDefined(); // 1 overdue + 1 high priority upcoming

      // Should not show other tabs
      expect(screen.queryByText('Upcoming')).toBeNull();
      expect(screen.queryByText('Overdue')).toBeNull();
      expect(screen.queryByText('Completed')).toBeNull();
    });

    it('shows priority tasks (overdue + high priority) in stress mode', () => {
      render(
        <Tasks
          {...defaultProps}
          isCurrentlyStressed={true}
        />,
      );

      // Should show overdue task
      expect(screen.getByTestId('task-item-overdue-1')).toBeDefined();
      // Should show high priority upcoming task
      expect(screen.getByTestId('task-item-upcoming-2')).toBeDefined();
      // Should not show medium priority upcoming task
      expect(screen.queryByTestId('task-item-upcoming-1')).toBeNull();
    });

    it('shows special empty state message in stress mode when no priority tasks', () => {
      const propsWithNoPriorityTasks = {
        ...defaultProps,
        upcomingTasks: [createMockTask({ priority: 'low' })],
        overdueTasks: [],
        isCurrentlyStressed: true,
      };

      render(<Tasks {...propsWithNoPriorityTasks} />);

      expect(screen.getByText("🎉 No priority tasks right now - you're doing great!")).toBeDefined();
    });
  });

  describe('Task Modal', () => {
    it('opens task modal when New Task button is clicked', () => {
      render(<Tasks {...defaultProps} />);

      const newTaskButton = screen.getByText('+ New Task');
      fireEvent.click(newTaskButton);

      expect(screen.getByTestId('task-form')).toBeDefined();
    });

    it('closes task modal when close button is clicked', () => {
      render(<Tasks {...defaultProps} />);

      // Open modal
      const newTaskButton = screen.getByText('+ New Task');
      fireEvent.click(newTaskButton);

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('task-form')).toBeNull();
    });

    it('passes isCreating state to task form', () => {
      render(
        <Tasks
          {...defaultProps}
          isCreating={true}
        />,
      );

      // Open modal
      const newTaskButton = screen.getByText('+ New Task');
      fireEvent.click(newTaskButton);

      expect(screen.getByText('Creating...')).toBeDefined();
    });

    it('calls createTask when form is submitted', () => {
      const mockCreateTask = vi.fn();
      render(
        <Tasks
          {...defaultProps}
          createTask={mockCreateTask}
        />,
      );

      // Open modal
      const newTaskButton = screen.getByText('+ New Task');
      fireEvent.click(newTaskButton);

      // Submit form
      const submitButton = screen.getByText('Submit Task');
      fireEvent.click(submitButton);

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('Task Interactions', () => {
    it('calls toggleTaskStatus when task toggle button is clicked', () => {
      const mockToggleTaskStatus = vi.fn();
      render(
        <Tasks
          {...defaultProps}
          toggleTaskStatus={mockToggleTaskStatus}
        />,
      );

      const toggleButton = screen.getAllByText('Toggle Status')[0];
      fireEvent.click(toggleButton);

      expect(mockToggleTaskStatus).toHaveBeenCalledTimes(1);
      expect(mockToggleTaskStatus).toHaveBeenCalledWith('upcoming-1', 'pending');
    });

    it('calls deleteTask when task delete button is clicked', () => {
      const mockDeleteTask = vi.fn();
      render(
        <Tasks
          {...defaultProps}
          deleteTask={mockDeleteTask}
        />,
      );

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(mockDeleteTask).toHaveBeenCalledTimes(1);
      expect(mockDeleteTask).toHaveBeenCalledWith('upcoming-1');
    });
  });

  describe('Tab Behavior', () => {
    it('shows active tab styling', () => {
      render(<Tasks {...defaultProps} />);

      const upcomingTab = screen.getByText('Upcoming (5)');
      expect(upcomingTab.getAttribute('data-variant')).toBe('solid');

      const overdueTab = screen.getByText('Overdue (2)');
      expect(overdueTab.getAttribute('data-variant')).toBe('outline');
    });

    it('updates active tab styling when switching tabs', () => {
      render(<Tasks {...defaultProps} />);

      const overdueTab = screen.getByText('Overdue (2)');
      fireEvent.click(overdueTab);

      expect(overdueTab.getAttribute('data-variant')).toBe('solid');

      const upcomingTab = screen.getByText('Upcoming (5)');
      expect(upcomingTab.getAttribute('data-variant')).toBe('outline');
    });

    it('sets tab title attribute correctly', () => {
      render(<Tasks {...defaultProps} />);

      const upcomingTab = screen.getByText('Upcoming (5)');
      expect(upcomingTab.getAttribute('title')).toBe('Plan your future tasks');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty task arrays gracefully', () => {
      const emptyProps = {
        ...defaultProps,
        upcomingTasks: [],
        overdueTasks: [],
        completedTasks: [],
        taskStats: createMockTaskStats({ pending: 0, overdue: 0, completed: 0 }),
      };

      render(<Tasks {...emptyProps} />);

      expect(screen.getByText('No upcoming tasks')).toBeDefined();
    });

    it('resets to first available tab when current tab becomes invalid', () => {
      // This test simulates tab switching behavior when tabs change
      const { rerender } = render(<Tasks {...defaultProps} />);

      // Switch to overdue tab
      const overdueTab = screen.getByText('Overdue (2)');
      fireEvent.click(overdueTab);

      // Now switch to stress mode (which doesn't have overdue tab)
      rerender(
        <Tasks
          {...defaultProps}
          isCurrentlyStressed={true}
        />,
      );

      // Should automatically switch to priority tab
      expect(screen.getByText('Priority (2)')).toBeDefined();
    });

    it('renders without crashing when all props are provided', () => {
      const complexProps: TasksProps = {
        upcomingTasks: [createMockTask({ title: 'Complex Task' })],
        overdueTasks: [],
        completedTasks: [],
        taskStats: createMockTaskStats(),
        isLoading: false,
        error: null,
        createTask: vi.fn(),
        deleteTask: vi.fn(),
        toggleTaskStatus: vi.fn(),
        isCreating: false,
        isCurrentlyStressed: false,
      };

      expect(() => render(<Tasks {...complexProps} />)).not.toThrow();
    });
  });
});
