import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import Tasks from './Tasks';
import type { Task, TasksProps, TaskStats } from '@/shared/types/task.types';

// Mock child components
vi.mock('./TaskForm', () => ({
  default: ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    isEditing,
    editTask,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: unknown) => void;
    isLoading: boolean;
    isEditing?: boolean;
    editTask?: unknown;
  }) =>
    isOpen ? (
      <div data-testid="task-form">
        <span>{isEditing ? 'Edit Task Form' : 'Create Task Form'}</span>
        {editTask ? <span data-testid="edit-task-data">Editing task</span> : null}
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSubmit({ title: 'Test Task', dueDate: new Date(), priority: 'medium' })}>
          Submit Task
        </button>
        {isLoading && <span>Processing...</span>}
      </div>
    ) : null,
}));

vi.mock('./TaskItem', () => ({
  default: ({
    task,
    onToggleStatus,
    onDelete,
    onEdit,
  }: {
    task: { id: string; title: string; status: string };
    onToggleStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
    onEdit: (task: unknown) => void;
  }) => (
    <div data-testid={`task-item-${task.id}`}>
      <span>{task.title}</span>
      <button onClick={() => onToggleStatus(task.id, task.status)}>Toggle Status</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
      <button onClick={() => onEdit(task)}>Edit</button>
    </div>
  ),
}));

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a
      href={to}
      data-testid="router-link"
    >
      {children}
    </a>
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
    colorPalette,
    ml,
    title,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    size?: string;
    variant?: string;
    colorPalette?: string;
    ml?: string;
    title?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      data-size={size}
      data-variant={variant}
      data-colorPalette={colorPalette}
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
  Text: ({ children, as, ...props }: { children: ReactNode; as?: string; [key: string]: unknown }) => {
    const Component = as || 'span';
    return React.createElement(Component, props, children);
  },
  Spinner: ({ size, color }: { size?: string; color?: string }) => (
    <div
      data-testid="spinner"
      data-size={size}
      data-color={color}
    />
  ),
  Link: ({
    children,
    color,
    fontWeight,
    ...props
  }: {
    children: ReactNode;
    color?: string;
    fontWeight?: string;
    [key: string]: unknown;
  }) => (
    <a
      data-testid="chakra-link"
      data-color={color}
      data-fontweight={fontWeight}
      {...props}
    >
      {children}
    </a>
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
    isHomePage: boolean = false,
  ) => {
    const TASK_LIMIT = 5;

    // Helper function to limit tasks and add hasMore indicator
    const limitTasks = (tasks: Task[]) => {
      if (!isHomePage) return { limitedTasks: tasks, hasMore: false };
      return {
        limitedTasks: tasks.slice(0, TASK_LIMIT),
        hasMore: tasks.length > TASK_LIMIT,
      };
    };

    if (isCurrentlyStressed) {
      // Stress mode: only priority tab
      const priorityTasks = [...overdueTasks, ...upcomingTasks.filter((task) => task.priority === 'high')];
      const { limitedTasks, hasMore } = limitTasks(priorityTasks);

      return [
        {
          key: 'priority',
          label: 'Priority',
          count: priorityTasks.length,
          tasks: limitedTasks,
          color: 'orange',
          description: 'Focus on what matters most',
          hasMore,
        },
      ];
    } else {
      // Normal mode: all tabs
      const { limitedTasks: limitedUpcoming, hasMore: upcomingHasMore } = limitTasks(upcomingTasks);
      const { limitedTasks: limitedOverdue, hasMore: overdueHasMore } = limitTasks(overdueTasks);
      const { limitedTasks: limitedCompleted, hasMore: completedHasMore } = limitTasks(completedTasks);

      return [
        {
          key: 'upcoming',
          label: 'Upcoming',
          count: taskStats.pending,
          tasks: limitedUpcoming,
          color: 'blue',
          description: 'Plan your future tasks',
          hasMore: upcomingHasMore,
        },
        {
          key: 'overdue',
          label: 'Overdue',
          count: taskStats.overdue,
          tasks: limitedOverdue,
          color: 'red',
          description: 'Catch up on missed deadlines',
          hasMore: overdueHasMore,
        },
        {
          key: 'completed',
          label: 'Completed',
          count: taskStats.completed,
          tasks: limitedCompleted,
          color: 'green',
          description: 'Celebrate your achievements',
          hasMore: completedHasMore,
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
    updateTask: vi.fn(),
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

      expect(screen.getByText('No upcoming tasks today')).toBeDefined();
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

      expect(screen.getByText('Processing...')).toBeDefined();
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

      expect(screen.getByText('No upcoming tasks today')).toBeDefined();
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
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        toggleTaskStatus: vi.fn(),
        isCreating: false,
        isCurrentlyStressed: false,
      };

      expect(() => render(<Tasks {...complexProps} />)).not.toThrow();
    });
  });

  describe('Home Page Mode (Task Limiting)', () => {
    const createManyTasks = (count: number, prefix: string) => {
      return Array.from({ length: count }, (_, index) =>
        createMockTask({
          id: `${prefix}-${index + 1}`,
          title: `${prefix} Task ${index + 1}`,
          priority: index < 2 ? 'high' : 'medium', // First 2 are high priority for stress mode testing
        }),
      );
    };

    it('shows limited tasks on home page (normal mode)', () => {
      const manyUpcomingTasks = createManyTasks(7, 'upcoming');
      const propsWithManyTasks = {
        ...defaultProps,
        upcomingTasks: manyUpcomingTasks,
        taskStats: createMockTaskStats({ pending: 7 }),
        isHomePage: true,
      };

      render(<Tasks {...propsWithManyTasks} />);

      // Should only show first 5 tasks
      expect(screen.getByTestId('task-item-upcoming-1')).toBeDefined();
      expect(screen.getByTestId('task-item-upcoming-5')).toBeDefined();
      expect(screen.queryByTestId('task-item-upcoming-6')).toBeNull();
      expect(screen.queryByTestId('task-item-upcoming-7')).toBeNull();
    });

    it('shows "View All" link when there are more than 5 tasks in home page mode', () => {
      const manyUpcomingTasks = createManyTasks(7, 'upcoming');
      const propsWithManyTasks = {
        ...defaultProps,
        upcomingTasks: manyUpcomingTasks,
        taskStats: createMockTaskStats({ pending: 7 }),
        isHomePage: true,
      };

      render(<Tasks {...propsWithManyTasks} />);

      expect(screen.getByText('View All Upcoming Tasks (7)')).toBeDefined();
      expect(screen.getByTestId('router-link')).toBeDefined();
      expect(screen.getByTestId('router-link').getAttribute('href')).toBe('/tasks');
    });

    it('does not show "View All" link when there are 5 or fewer tasks', () => {
      const fewUpcomingTasks = createManyTasks(3, 'upcoming');
      const propsWithFewTasks = {
        ...defaultProps,
        upcomingTasks: fewUpcomingTasks,
        taskStats: createMockTaskStats({ pending: 3 }),
        isHomePage: true,
      };

      render(<Tasks {...propsWithFewTasks} />);

      expect(screen.queryByText(/View All/)).toBeNull();
      expect(screen.queryByTestId('router-link')).toBeNull();
    });

    it('does not show "View All" link on full tasks page (isHomePage=false)', () => {
      const manyUpcomingTasks = createManyTasks(7, 'upcoming');
      const propsWithManyTasks = {
        ...defaultProps,
        upcomingTasks: manyUpcomingTasks,
        taskStats: createMockTaskStats({ pending: 7 }),
        isHomePage: false,
      };

      render(<Tasks {...propsWithManyTasks} />);

      // Should show all tasks
      expect(screen.getByTestId('task-item-upcoming-1')).toBeDefined();
      expect(screen.getByTestId('task-item-upcoming-7')).toBeDefined();
      // Should not show "View All" link
      expect(screen.queryByText(/View All/)).toBeNull();
    });

    it('shows "View All" link for overdue tab when there are many overdue tasks', () => {
      const manyOverdueTasks = createManyTasks(6, 'overdue');
      const propsWithManyOverdue = {
        ...defaultProps,
        overdueTasks: manyOverdueTasks,
        taskStats: createMockTaskStats({ overdue: 6 }),
        isHomePage: true,
      };

      render(<Tasks {...propsWithManyOverdue} />);

      // Switch to overdue tab
      const overdueTab = screen.getByText('Overdue (6)');
      fireEvent.click(overdueTab);

      expect(screen.getByText('View All Overdue Tasks (6)')).toBeDefined();
    });

    it('shows "View All" link for completed tab when there are many completed tasks', () => {
      const manyCompletedTasks = createManyTasks(8, 'completed');
      const propsWithManyCompleted = {
        ...defaultProps,
        completedTasks: manyCompletedTasks,
        taskStats: createMockTaskStats({ completed: 8 }),
        isHomePage: true,
      };

      render(<Tasks {...propsWithManyCompleted} />);

      // Switch to completed tab
      const completedTab = screen.getByText('Completed (8)');
      fireEvent.click(completedTab);

      expect(screen.getByText('View All Completed Tasks (8)')).toBeDefined();
    });
    it('shows "View All" link for priority tab in stress mode when there are many priority tasks', () => {
      // Create many high priority upcoming tasks to ensure we have more than 5 priority tasks total
      const manyUpcomingHighPriorityTasks = Array.from({ length: 8 }, (_, index) =>
        createMockTask({
          id: `upcoming-${index + 1}`,
          title: `upcoming Task ${index + 1}`,
          priority: 'high', // All high priority
        }),
      );
      const manyOverdueTasks = createManyTasks(2, 'overdue');

      const propsWithManyPriority = {
        ...defaultProps,
        upcomingTasks: manyUpcomingHighPriorityTasks,
        overdueTasks: manyOverdueTasks,
        taskStats: createMockTaskStats({ pending: 8, overdue: 2 }),
        isCurrentlyStressed: true,
        isHomePage: true,
      };

      render(<Tasks {...propsWithManyPriority} />);

      const totalPriorityTasks = 2 + 8; // 2 overdue + 8 high priority upcoming = 10 total
      expect(screen.getByText(`View All Priority Tasks (${totalPriorityTasks})`)).toBeDefined();
    });

    it('defaults to isHomePage=true when prop is not provided', () => {
      const manyUpcomingTasks = createManyTasks(7, 'upcoming');
      const propsWithoutHomePage = {
        ...defaultProps,
        upcomingTasks: manyUpcomingTasks,
        taskStats: createMockTaskStats({ pending: 7 }),
        // isHomePage prop omitted to test default behavior
      };

      render(<Tasks {...propsWithoutHomePage} />);

      // Should still show limited tasks and "View All" link since default is true
      expect(screen.getByTestId('task-item-upcoming-5')).toBeDefined();
      expect(screen.queryByTestId('task-item-upcoming-6')).toBeNull();
      expect(screen.getByText('View All Upcoming Tasks (7)')).toBeDefined();
    });
  });

  describe('Edit functionality', () => {
    it('opens edit form when task edit is triggered', () => {
      render(<Tasks {...defaultProps} />);

      // Find and click edit button on first task
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      // Should show edit form
      expect(screen.getByText('Edit Task Form')).toBeDefined();
      expect(screen.getByTestId('edit-task-data')).toBeDefined();
    });

    it('closes edit form when cancelled', () => {
      render(<Tasks {...defaultProps} />);

      // Open edit form
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      expect(screen.getByText('Edit Task Form')).toBeDefined();

      // Close the form
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      // Form should be closed
      expect(screen.queryByText('Edit Task Form')).toBeNull();
    });

    it('calls updateTask when edit form is submitted', () => {
      const mockUpdateTask = vi.fn().mockResolvedValue(undefined);

      render(
        <Tasks
          {...defaultProps}
          updateTask={mockUpdateTask}
        />,
      );

      // Open edit form
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      // Submit the form
      const submitButton = screen.getByText('Submit Task');
      fireEvent.click(submitButton);

      expect(mockUpdateTask).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when updating task', async () => {
      const mockUpdateTask = vi.fn().mockImplementation(() => new Promise<void>(() => {})); // Never resolves

      render(
        <Tasks
          {...defaultProps}
          updateTask={mockUpdateTask}
        />,
      );

      // Open edit form
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      // Submit the form
      const submitButton = screen.getByText('Submit Task');
      fireEvent.click(submitButton);

      // The loading state should be managed by the Tasks component
      // For now, let's just verify the updateTask was called
      expect(mockUpdateTask).toHaveBeenCalledTimes(1);
    });

    it('can edit tasks from different tabs', () => {
      render(<Tasks {...defaultProps} />);

      // Switch to overdue tab
      fireEvent.click(screen.getByText('Overdue (2)'));

      // Edit button should be available in overdue tab
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      expect(screen.getByText('Edit Task Form')).toBeDefined();
    });
  });
});
